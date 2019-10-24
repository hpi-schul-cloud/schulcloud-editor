const { disallow } = require('feathers-hooks-common');
const { GeneralError } = require('@feathersjs/errors');
const { checkCoursePermission } = require('../../global/hooks');
const { prepareParams, convertSuccessMongoPatchResponse } = require('../../utils');
const {
	readPermission,
	addLessonIdAndCourseId,
	modifiedQueryToTarget,
} = require('./hooks');

// todo validation
const SyncGroupsServiceHooks = {};
SyncGroupsServiceHooks.before = {
	all: [],
	find: [
		readPermission,
		modifiedQueryToTarget,
	],
	get: [
		readPermission,
		modifiedQueryToTarget,
	],
	create: [
		addLessonIdAndCourseId,
		checkCoursePermission('COURSE_EDIT'),
	],
	update: [
		disallow(),
	],
	patch: [
		checkCoursePermission('COURSE_EDIT'),
		modifiedQueryToTarget,
	],
	remove: [
		checkCoursePermission('COURSE_EDIT'),
		modifiedQueryToTarget,
	],
};

class SyncGroupsService {
	constructor({ docs = {} }) {
		this.docs = docs;
		this.baseService = 'models/syncGroup';
		this.err = {
			softDelete: 'Can not set soft delete.',
		};
	}

	find(params) {
		return this.app.service(this.baseService)
			.find(prepareParams(params));
	}

	get(id, params) {
		return this.app.service(this.baseService)
			.get(id, prepareParams(params));
	}

	remove(id, _params) {
		const params = prepareParams(_params);
		params.mongoose = { writeResult: true };
		const deletedAt = new Date();
		return this.app.service(this.baseService)
			.patch(id, { deletedAt }, params)
			.then(res => convertSuccessMongoPatchResponse(res, { id, deletedAt }, true))
			.catch((err) => {
				throw new GeneralError(this.err.softDelete, err);
			});
	}

	create(data, params) {
		return this.app.service(this.baseService)
			.create(data, prepareParams(params));
	}

	patch(id, data, params) {
		return this.app.service(this.baseService)
			.patch(id, data, prepareParams(params));
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	SyncGroupsServiceHooks,
	SyncGroupsService,
};
