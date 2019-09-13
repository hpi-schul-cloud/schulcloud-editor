const { disallow } = require('feathers-hooks-common');
const { checkCoursePermission } = require('../../global/hooks');
const { copyParams } = require('../../global/utils');
const { readPermission } = require('./hooks');

// todo validation
const SyncGroupsServiceHooks = {};
SyncGroupsServiceHooks.before = {
	all: [],
	find: [readPermission],
	get: [readPermission],
	create: [
		checkCoursePermission('COURSE_EDIT'),
	],
	update: [disallow()],
	patch: [
		checkCoursePermission('COURSE_EDIT'),
	],
	remove: [
		checkCoursePermission('COURSE_EDIT'),
	],
};

class SyncGroupsService {
	constructor(options) {
		this.options = options || {};
		this.docs = {};
		this.baseService = 'model/syncGroup';
	}

	find(params) {
		return this.app.service(this.baseService)
			.find(copyParams(params));
	}

	get(id, params) {
		return this.app.service(this.baseService)
			.get(id, copyParams(params));
	}

	remove(id, params) {
		return this.app.service(this.baseService)
			.remove(id, copyParams(params));
	}

	create(id, data, params) {
		return this.app.service(this.baseService)
			.create(id, data, copyParams(params));
	}

	patch(id, data, params) {
		return this.app.service(this.baseService)
			.patch(id, data, copyParams(params));
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	SyncGroupsServiceHooks,
	SyncGroupsService,
};
