/* eslint-disable class-methods-use-this */
const { NotFound, Forbidden, BadRequest } = require('@feathersjs/errors');
const { validateSchema } = require('feathers-hooks-common');
const Ajv = require('ajv');

const { checkCoursePermission } = require('../../global/hooks');
const { copyParams } = require('../../global/utils');
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
			update: 'Failed to update the lesson.',
			remove: 'Failed to delete the lesson.',
		}
	}

	setup(app) {
		this.app = app;
	}

	async find(params) {
		const { route } = params;

		try {
			const lessons = await LessonModel.find({
				courseId: route.courseId,
				deletedAt: { $exists: false },
			}).select({
				_id: 1,
				title: 1,
				note: 1,
				visible: 1,
				courseId: 1,
				position: 1,
			}).lean().exec();

			return lessons || [];
		} catch (err) {
			throw new BadRequest(this.err.find, err);
		}
	}

	async get(id, params) {
		const { route } = params;
		let lesson;
		const mRequest = LessonModel
			.findOne({
				_id: id,
				courseId: route.courseId,
				deletedAt: { $exists: false },
			}).populate('sections')
			.select({
				_id: 1,
				title: 1,
				note: 1,
				sections: 1,
				courseId: 1,
			});

		if (params.all === 'true') {
			mRequest.populate('sections');
		}

		try {
			lesson = await mRequest.lean().exec();
		} catch (err) {
			throw new BadRequest(this.err.get, err);
		}
		if (!lesson) throw new NotFound();

		return lesson;
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
				lessonId: lesson._id,
			}, params);

			const writeGroupPromise = this.app.service('models/syncGroup').create({
				users: users.write,
				permission: 'write',
				courseId,
				lessonId: lesson._id,
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

	async patch(id, data, params) {
		const { route } = params;

		try {
			return await LessonModel.updateOne({
				_id: id,
				courseId: route.courseId,
				deletedAt: { $exists: false },
			}, {
				...data,
			}).exec();
		} catch (err) {
			throw new BadRequest(this.err.update, err);
		}
	}

	async remove(id, params) {
		const { route } = params;
		try {
			const lesson = await LessonModel.findOne({
				_id: id,
				courseId: route.courseId,
			}).exec();

			lesson.deletedAt = new Date();
			await lesson.save();
			return;
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
