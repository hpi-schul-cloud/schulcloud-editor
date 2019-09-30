const { BadRequest } = require('@feathersjs/errors');
const { disallow } = require('feathers-hooks-common');

const { copyParams } = require('../../global/utils');

// todo validation
const SectionServiceHooks = {};
SectionServiceHooks.before = {
	all: [],
	find: [
	],
	get: [
	],
	create: [
	],
	update: [
		disallow(),
	],
	patch: [
	],
	remove: [
	],
};

class SectionService {
	constructor({ docs = {} }) {
		this.docs = docs;
		this.baseService = 'models/SectionModel';
		this.err = {
			softDelete: 'Can not set soft delete.',
		};
	}

	setScope(params) {
		const { lessonId } = params.route;
		params.query.context = 'section';
		params.query.ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		return params;
	}

	async find(_params) {
		const params = this.setScope(copyParams(_params));

		return this.app.service(this.baseService)
			.find(params);
	}

	get(id, _params) {
		const params = this.setScope(copyParams(_params));
		return this.app.service(this.baseService)
			.get(id, params);
	}

	remove(id, _params) {
		const params = this.setScope(copyParams(_params));
		params.mongoose = { writeResult: true };
		const deletedAt = new Date();
		return this.app.service(this.baseService)
			.patch(id, { deletedAt }, params)
			.then((res) => {
				if (res.n === 1 && res.nModified === 1 && res.ok === 1) {
					return { id, deletedAt };
				}
				throw res;
			})
			.catch((err) => {
				throw new BadRequest(this.err.softDelete, err);
			});
	}

	async create(data, _params) {
		const { lessonId } = _params.route;
		const { app } = this;

		data.ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		data.context = 'section';

		const params = copyParams(_params);
		// params.query.lessonId = lessonId;
		const syncGroups = await app.service('models/syncGroup').find(params);

		const permService = app.service('lesson/:lessonId/sections/:ressourceId/permission');
		const key = permService.permissionKey;
		data[key] = await permService.createDefaultPermissionsData(syncGroups.data);

		return this.app.service(this.baseService).create(data, copyParams(_params));
	}

	patch(id, data, _params) {
		const params = this.setScope(copyParams(_params));
		return this.app.service(this.baseService)
			.patch(id, data, params);
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	SectionService,
	SectionServiceHooks,
};
