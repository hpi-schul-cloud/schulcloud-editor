/* eslint-disable class-methods-use-this */
const { NotFound, Forbidden, BadRequest } = require('@feathersjs/errors');
const { validateSchema } = require('feathers-hooks-common');
const Ajv = require('ajv');

const { checkCoursePermission, filterOutResults, joinChannel } = require('../../global/hooks');
const {
	prepareParams,
	permissions,
	paginate,
	removeKeyFromList,
} = require('../../utils');
const { create: createSchema, patch: patchSchema } = require('./schemes');
const { LessonModel } = require('./models/');
const { setCourseId, defaultName } = require('./hooks/');

const DEFAULT_CREATE_PERMISSION = 'LESSONS_CREATE';
const DEFAULT_VIEW_PERMISSION = 'LESSONS_VIEW';

const lessonsHooks = {
	before: {
		find: [],
		get: [],
		create: [
			setCourseId,
			defaultName,
			validateSchema(createSchema, Ajv),
			checkCoursePermission(DEFAULT_CREATE_PERMISSION),
		],
		patch: [
			validateSchema(patchSchema, Ajv),
		],
		remove: [

		],
	},
	after: {

		get: [
			joinChannel('lessons'),
			filterOutResults('permissions'),
		],
		find: [
			filterOutResults('permissions'),
		],
	},
};


// todo remapped to lessonModelServices
class Lessons {
	constructor({ docs = {} }) {
		this.docs = docs;

		this.err = Object.freeze({
			create: 'Failed to create the lesson.',
			get: 'Failed to get the lesson',
			find: 'Failed to find lessons.',
			patch: 'Failed to patch the lesson.',
			remove: 'Failed to delete the lesson.',
			noAccess: 'You have no access.',
			notFound: 'Ressource not found.',
		});
	}

	setup(app) {
		this.app = app;
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

			return paginate(permissions.filterHasRead(lessons, user), params);
		} catch (err) {
			throw new BadRequest(this.err.find, err);
		}
	}

	async get(_id, params) {
		const { route: { courseId }, user } = params;
		let lesson;
		let sections;
		const parallelRequest = [];
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
			});


		parallelRequest.push(mRequest.lean().exec());

		if (params.query.all === 'true') {
			// call sections via route and not populate because of permission check and socket channels
			parallelRequest.push(this.app.service('lesson/:lessonId/sections').find({
				...params,
				route: {
					lessonId: _id,
				},
			}));
		}


		try {
			[lesson, sections] = await Promise.all(parallelRequest);
		} catch (err) {
			throw new BadRequest(this.err.get, err);
		}
		if (!lesson) throw new NotFound();

		if (!permissions.hasRead(lesson.permissions, user)) {
			throw new Forbidden(this.err.noAccess);
		}

		if (sections) {
			lesson.sections = sections.data;
		}

		return lesson;
	}

	async createDefaultGroups(lesson, _params) {
		const lessonId = lesson._id;
		const params = prepareParams(_params);
		params.route.ressourceId = lessonId; // todo check if it can removed
		params.route.lessonId = lessonId;

		const { authorization, route: { courseId } } = params;
		const courseMembers = await this.app.serviceRoute('server/courses/members')
			.find(authorization, { courseId });

		const users = {
			read: [],
			write: [],
		};

		Object.entries(courseMembers).forEach(([userId, perms]) => {
			if (perms.includes(DEFAULT_CREATE_PERMISSION)) {
				users.write.push(userId);
			} else if (perms.includes(DEFAULT_VIEW_PERMISSION)) {
				users.read.push(userId);
			} else {
				this.app.logger.warning(`User with id ${userId} has no permission to add it to lesson.`);
			}
		});

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

	async createEmptySection(_lessonId, syncGroups, params) {
		const lessonId = _lessonId.toString();
		params.route.lessonId = lessonId;
		params.payload = { syncGroups };
		return this.app.service('/lesson/:lessonId/sections')
			.create({ lessonId }, params);
	}

	async create(data, params) {
		try {
			const $lesson = new LessonModel({
				...data,
			});
			const lessonId = $lesson._id;

			const defaultGroups = await this.createDefaultGroups($lesson, params);
			const permissionService = this.app.service('course/:courseId/lessons/:ressourceId/permission');
			const key = permissionService.permissionKey;
			const [permissionsData, emptySection] = await Promise.all([
				permissionService.createDefaultPermissionsData(defaultGroups),
				this.createEmptySection(lessonId, defaultGroups, params),
			]);
			$lesson[key] = permissionsData;
			$lesson.sections.push(emptySection._id);

			await $lesson.save();
			return { _id: $lesson._id };
		} catch (err) {
			throw new BadRequest(this.err.create, err);
		}
	}

	async patch(_id, data, params) {
		const { route: { courseId }, user } = params;

		const $lesson = await LessonModel.findOne({
			_id,
			courseId,
			deletedAt: { $exists: false },
		}).populate({
			path: 'permissions.group',
			select: 'users',
		}).select('permissions').exec()
			.catch((err) => {
				throw new BadRequest(this.err.patch, err);
			});

		if (!$lesson) throw new NotFound();
		if (!permissions.hasWrite($lesson.permissions, user)) {
			throw new Forbidden(this.err.noAccess);
		}

		try {
			Object.entries(data).forEach(([key, value]) => {
				$lesson[key] = value;
			});
			await $lesson.save();
			return {
				...data,
				_id,
			};
		} catch (err) {
			throw new BadRequest(this.err.patch, err);
		}
	}

	async remove(_id, params) {
		const { route: { courseId }, user } = params;

		const $lesson = await LessonModel.findOne({
			_id,
			courseId,
			deletedAt: { $exists: false },
		}).populate({
			path: 'permissions.group',
			select: 'users',
		}).exec()
			.catch((err) => {
				throw new BadRequest(this.err.remove, err);
			});

		if (!$lesson) throw new NotFound();
		if (!permissions.hasWrite($lesson.permissions, user)) {
			throw new Forbidden(this.err.noAccess);
		}

		try {
			const deletedAt = new Date();
			$lesson.deletedAt = deletedAt;
			await $lesson.save();
			return { _id, deletedAt };
		} catch (err) {
			throw new BadRequest(this.err.remove, err);
		}
	}
}


module.exports = {
	Lessons,
	lessonsHooks,
};
