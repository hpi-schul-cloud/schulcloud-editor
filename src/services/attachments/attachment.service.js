/* eslint-disable class-methods-use-this */
const { Forbidden } = require('@feathersjs/errors');
// const { validateSchema } = require('feathers-hooks-common');
// const Ajv = require('ajv');

// const { } = require('../../global/hooks');
const {
	prepareParams,
	permissions: permissionsHelper,
} = require('../../utils');
// const { } = require('./schemes');
// const { } = require('./hooks/');

const AttachmentServiceHooks = {
	before: {
		create: [
			// TODO: Schema
		],
		patch: [
			// TODO: Schema
		],
		remove: [
			// TODO: Schema
		],
	},
	/* after: {

		get: [
		],
		find: [
		],
	}, */
};

/**
 * Attachments bind to the parents over target and targetModel.
 * They can not get, or find over this external services.
 */
class AttachmentService {
	constructor({ docs = {} } = {}) {
		this.docs = docs;

		this.err = Object.freeze({
			noAccess: 'You have no access',
		});
	}

	setup(app) {
		this.app = app;
	}

	populate(params) {
		params.query.$populate = [
			{ path: 'permissions.group', select: 'users' },
		];
		return params;
	}

	async create(data, params) {
		const internParams = this.populate(prepareParams(params));
		const result = this.app.service(`models/${data.targetModel}`).get(data.target, internParams);
		if (!result || !permissionsHelper.hasWrite(result.permissions, params.user)) {
			throw new Forbidden(this.err.noAccess);
		}
		return data;
	}

	async patch(id, data, params) {
		// permissions
	}

	async remove(id, params) {
		// permissions
	}
}


module.exports = {
	AttachmentService,
	AttachmentServiceHooks,
};
