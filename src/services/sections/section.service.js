const { GeneralError } = require('@feathersjs/errors');
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
		this.baseService = 'models/section';
		this.err = {
			softDelete: 'Can not set soft delete.',
		};
	}

	find(params) {
		return this.app.service(this.baseService)
			.find(copyParams(params));
	}

	get(id, params) {
		return this.app.service(this.baseService)
			.get(id, copyParams(params));
	}

	remove(id, _params) {
		const params = copyParams(_params);
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
				throw new GeneralError(this.err.softDelete, err);
			});
	}

	create(data, params) {
		return this.app.service(this.baseService)
			.create(data, copyParams(params));
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
	SectionService,
	SectionServiceHooks,
};
