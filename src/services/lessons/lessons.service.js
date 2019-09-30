/* eslint-disable class-methods-use-this */
const { NotFound, Forbidden, BadRequest } = require('@feathersjs/errors');
const { validateSchema } = require('feathers-hooks-common');
const Ajv = require('ajv');

const { checkCoursePermission } = require('../../global/hooks');
const { 
	copyParams,
	testAccess,
	dataToSetQuery,
	convertSuccessMongoPatchResponse,
} = require('../../global/utils');
const { create: createSchema, patch: patchSchema } = require('./schemes');
const { LessonModel } = require('./models/');
const { setCourseId } = require('./hooks/');

const lessonsHooks = {
	before: {
		find: [],
		get: [],
		create: [
			setCourseId,
			validateSchema(createSchema, Ajv),
			checkCoursePermission('LESSONS_CREATE'),
		],
		patch: [
			validateSchema(patchSchema, Ajv),
		],
		remove: [

		],
	},
	after: {},
};


// todo remapped to lessonModelServices
class Lessons {
	constructor({ docs = {} }) {
		this.docs = docs;

		this.err = {
			create: 'Failed to create the lesson.',
			get: 'Failed to get the lesson',
			find: 'Failed to find lessons.',
			patch: 'Failed to patch the lesson.',
			remove: 'Failed to delete the lesson.',
			noAccess: 'You have no access.',
		};
	}

	setup(app) {
		this.app = app;
	}

	clearPermission(lessons) {
		if (!Array.isArray(lessons)) {
			lessons = [lessons];
		}
		lessons.forEach(l => delete l.permissions);
		return lessons;
	}

	async find(params) {
		const { route: { courseId }, user } = params;

		try {
			const lessons = await LessonModel.find({
				courseId,
				deletedAt: { $exists: false },
			}).populate({
				path: 'permissions.group',
				select: 'users',
			}).select({
				_id: 1,
				title: 1,
				note: 1,
				visible: 1,
				permissions: 1,
				courseId: 1,
				position: 1,
			}).lean()
				.exec();

			// todo pagination
			const lessonsWithAccess = (lessons || []).filter(
				l => testAccess(l.permissions, user, 'read')
				|| testAccess(l.permissions, user, 'write'),
			);


			return this.clearPermission(lessonsWithAccess);
		} catch (err) {
			throw new BadRequest(this.err.find, err);
		}
	}

	async get(_id, params) {
		const { route: { courseId }, user } = params;
		let lesson;
		const mRequest = LessonModel
			.findOne({
				_id,
				courseId,
				deletedAt: { $exists: false },
			}).populate({
				path: 'permissions.group',
				select: 'users',
			}).select({
				_id: 1,
				title: 1,
				note: 1,
				permissions: 1,
				sections: 1,
				courseId: 1,
			}).lean();

		if (params.all === 'true') {
			mRequest.populate('sections');
		}

		try {
			lesson = await mRequest.lean().exec();
		} catch (err) {
			throw new BadRequest(this.err.get, err);
		}
		if (!lesson) throw new NotFound();

		const access = testAccess(lesson.permissions, user, 'read')
			|| testAccess(lesson.permissions, user, 'write');

		if (!access) {
			throw new Forbidden(this.err.noAccess);
		}

		return this.clearPermission(lesson);
	}

	async createDefaultGroups(lesson, _params) {
		const lessonId = lesson._id;
		const params = copyParams(_params);
		params.route.ressourceId = lessonId;
		params.route.lessonId = lessonId;

		const { authorization, route: { courseId } } = params;
		const coursePermissions = this.app.get('routes:server:coursePermissions');
		const users = {
			read: [],
			write: ['0000d231816abba584714c9e'], // todo replace
		};
		try {
			// const res = await coursePermissions(courseId, { authorization });
			this.app.logger.warning('Course fetch data do not exist');

			const readGroupPromise = this.app.service('models/syncGroup').create({
				users: users.read,
				permission: 'read',
				courseId,
				lessonId,
			}, params);

			const writeGroupPromise = this.app.service('models/syncGroup').create({
				users: users.write,
				permission: 'write',
				courseId,
				lessonId,
			}, params);

			return Promise.all([readGroupPromise, writeGroupPromise]);
		} catch (err) {
			throw new Forbidden(this.err.noAccess, err);
		}
	}

	async create(data, params) {
		const { user } = params;
		try {
			const lesson = new LessonModel({
				...data,
				createdBy: user.id,
			});

			const defaultGroups = await this.createDefaultGroups(lesson, params);
			const permissionService = this.app.service('course/:courseId/lessons/:ressourceId/permission');
			const key = permissionService.permissionKey;
			lesson[key] = await permissionService.createDefaultPermissionsData(defaultGroups);

			await lesson.save();
			return { _id: lesson._id };
		} catch (err) {
			throw new BadRequest(this.err.create, err);
		}
	}

	async patch(_id, data, params) {
		const { route: { courseId }, user } = params;

		const lesson = await LessonModel.findOne({
			_id,
			courseId,
		}).populate({
			path: 'permissions.group',
			select: 'users',
		}).lean().exec()
			.catch((err) => {
				throw new BadRequest(this.err.patch, err);
			});

		if (!testAccess(lesson.permissions, user, 'write')) {
			throw new Forbidden(this.err.noAccess);
		}

		try {
			const patchStatus = await LessonModel.updateOne({
				_id,
				courseId,
				deletedAt: { $exists: false },
			}, dataToSetQuery(data)).exec();
			return convertSuccessMongoPatchResponse(patchStatus, { _id }, true);
		} catch (err) {
			throw new BadRequest(this.err.patch, err);
		}
	}

	async remove(_id, params) {
		const { route: { courseId }, user } = params;

		const lesson = await LessonModel.findOne({
			_id,
			courseId,
		}).populate({
			path: 'permissions.group',
			select: 'users',
		}).exec().catch((err) => {
			throw new BadRequest(this.err.remove, err);
		});

		if (!testAccess(lesson.permissions, user, 'write')) {
			throw new Forbidden(this.err.noAccess);
		}

		try {
			lesson.deletedAt = new Date();
			await lesson.save();
			return { _id };
		} catch (err) {
			throw new BadRequest(this.err.remove, err);
		}
	}
}

const joinLessonChannel = app => (user) => {
	app.channel(`lessons/${user.lesson}`).join(user.connection);
};

module.exports = {
	Lessons,
	lessonsHooks,
	joinLessonChannel,
};
