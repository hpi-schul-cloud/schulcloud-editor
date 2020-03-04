const { Forbidden, NotFound } = require('@feathersjs/errors');
const { validateSchema } = require('feathers-hooks-common');
const Ajv = require('ajv');

const logger = require('../../logger');
const { patchSchema, createSchema } = require('./schemas');

const {
	prepareParams,
	permissions: permissionsHelper,
} = require('../../utils');

const AttachmentServiceHooks = {
	before: {
		create: [
			validateSchema(createSchema, Ajv),
		],
		patch: [
			validateSchema(patchSchema, Ajv),
		],
		remove: [
			// TODO: Schema
		],
	},
};

/**
 * Attachments bind to the parents over target and targetModel.
 * They can not get, or find over this external services.
 */
class AttachmentService {
	constructor({ docs = {}, baseService, typesToModelServices } = {}) {
		if (!baseService || !typesToModelServices) {
			logger.error('AttachmentService: missing params!', { baseService, typesToModelServices });
		}
		this.docs = docs;
		this.baseService = baseService;
		this.typesToModelServices = typesToModelServices;

		this.err = Object.freeze({
			noAccess: 'You have no access',
			notFound: 'Element do not exist.',
		});
	}

	setup(app) {
		this.app = app;
	}

	scopeParams(params) {
		return prepareParams(params, {
			$select: ['title', 'description', 'type', 'value'],
		});
	}

	getTarget(id, params) {
		return this.app.service(this.baseService)
			.get(id, prepareParams(params, {
				$select: ['target', 'targetModel'],
			}))
			.catch((err) => {
				throw new NotFound(this.err.notFound, err);
			});
	}

	async hasPermission(target, targetModel, params) {
		const modelServiceName = this.typesToModelServices[targetModel];
		const result = await this.app.service(modelServiceName)
			.get(target, prepareParams(params, {
				$populate: [
					{ path: 'permissions.group', select: 'users' },
				],
			}));

		if (!result || !permissionsHelper.hasWrite(result.permissions, params.user)) {
			throw new Forbidden(this.err.noAccess);
		}
		return result;
	}

	async create(data, params) {
		await this.hasPermission(data.target, data.targetModel, params);
		return this.app.service(this.baseService)
			.create(data, this.scopeParams(params));
	}

	// target and targetModel is disallowed
	async patch(id, data, params) {
		const { target, targetModel } = await this.getTarget(id, params);
		await this.hasPermission(target, targetModel, params);
		return this.app.service(this.baseService)
			.patch(id, data, this.scopeParams(params));
	}

	async remove(_id, params) {
		const { target, targetModel } = await this.getTarget(_id, params);
		await this.hasPermission(target, targetModel, params);
		const deletedAt = new Date();
		return this.app.service(this.baseService)
			.patch(_id, { deletedAt }, prepareParams(params, {
				$select: '_id',
			}))
			.then(() => ({ _id, deletedAt }));
	}
}


module.exports = {
	AttachmentService,
	AttachmentServiceHooks,
};
