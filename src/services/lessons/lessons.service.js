/* eslint-disable class-methods-use-this */
const { NotFound, Forbidden, BadRequest } = require('@feathersjs/errors');
const { validateSchema } = require('feathers-hooks-common');
const Ajv = require('ajv');

const {
	checkCoursePermission,
	filterOutResults,
	joinChannel,
} = require('../../global/hooks');
const {
	prepareParams,
	permissions,
	paginate,
	setUserScopePermissionForFindRequests,
	setUserScopePermission,
	isfilledArray,
} = require('../../utils');
const {
	create: createSchema,
	patch: patchSchema,
} = require('./schemes');
const { LessonModel } = require('./models/');
const { setCourseId, defaultName } = require('./hooks/');

const DEFAULT_CREATE_PERMISSIONS = ['LESSONS_CREATE', 'TOPIC_CREATE'];
const DEFAULT_VIEW_PERMISSIONS = ['LESSONS_VIEW', 'TOPIC_VIEW'];

const lessonsHooks = {
	before: {
		find: [],
		get: [],
		create: [
			setCourseId,
			defaultName,
			validateSchema(createSchema, Ajv),
			checkCoursePermission(...DEFAULT_CREATE_PERMISSIONS),
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

	scopeParams(params) {
		return prepareParams(params, {
			courseId: params.route.courseId,
			$populate: [
				{ path: 'permissions.group', select: 'users' },
			],
			$select: ['title', 'permissions', 'sections', 'courseId', 'position'],
		});
	}

	async find(params) {
		const lessons = await this.app.service('models/LessonModel')
			.find(this.scopeParams(params))
			.catch((err) => {
				throw new BadRequest(this.err.find, err);
			});

		const paginatedResult = paginate(permissions.filterHasRead(lessons, params.user), params);
		return setUserScopePermissionForFindRequests(paginatedResult, params.user);
	}

	async get(id, params) {
		const { user } = params;

		const getLesson = this.app.service('models/LessonModel')
			.get(id, this.scopeParams(params));

		let findSections;
		if (params.query.all === 'true') {
			// call sections via route and not populate because of permission check and socket channels
			findSections = this.app.service('lesson/:lessonId/sections').find({
				...params,
				route: {
					lessonId: id,
				},
			});
		}

		const findAttachments = this.app.service('models/AttachmentModel')
			.find(prepareParams(params, {
				target: id,
			}));

		const [lesson, attachments, sections] = await Promise.all([
			getLesson, findAttachments, findSections,
		]).catch((err) => {
			throw new BadRequest(this.err.get, err);
		});

		if (!lesson) throw new NotFound();

		if (!permissions.hasRead(lesson.permissions, user)) {
			throw new Forbidden(this.err.noAccess);
		}

		if (sections) {
			lesson.sections = lesson.sections
				.map((sectionId) => sections.data
					.find(({ _id }) => sectionId.toString() === _id.toString()));
		}

		if (isfilledArray(attachments.data)) {
			lesson.attachments = attachments.data;
		}

		return setUserScopePermission(lesson, lesson.permissions, user);
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
			if (DEFAULT_CREATE_PERMISSIONS.some((p) => perms.includes(p))) {
				users.write.push(userId);
			} else if (DEFAULT_VIEW_PERMISSIONS.some((p) => perms.includes(p))) {
				users.read.push(userId);
			} else {
				this.app.logger.warning(`User with id ${userId} has no permission to add it to lesson.`);
			}
		});

		try {
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
			.create({}, params);
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
			return setUserScopePermission({ _id: $lesson._id }, 'write');
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
				$lesson[key] = value; // TODO: over patch
			});

			await $lesson.save();
			return setUserScopePermission({
				...data,
				_id,
			}, 'write');
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
			return setUserScopePermission({ _id, deletedAt }, 'write');
		} catch (err) {
			throw new BadRequest(this.err.remove, err);
		}
	}
}


module.exports = {
	Lessons,
	lessonsHooks,
};
