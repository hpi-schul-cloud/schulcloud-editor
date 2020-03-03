const { Forbidden, NotFound } = require('@feathersjs/errors');

const logger = require('../../logger');
// const { validateSchema } = require('feathers-hooks-common');
// const Ajv = require('ajv');

const {
	prepareParams,
	permissions: permissionsHelper,
} = require('../../utils');

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
			.create(data, prepareParams(params));
	}

	// target and targetModel is disallowed
	async patch(id, data, params) {
		const { target, targetModel } = await this.getTarget(id, params);
		await this.hasPermission(target, targetModel, params);
		return this.app.service(this.baseService)
			.patch(id, data, prepareParams(params));
	}

	async remove(_id, params) {
		const { target, targetModel } = await this.getTarget(_id, params);
		await this.hasPermission(target, targetModel, params);
		const deletedAt = new Date();
		return this.app.service(this.baseService)
			.patch(_id, { deletedAt }, prepareParams(params))
			.then(() => ({ _id, deletedAt }));
	}
}


module.exports = {
	AttachmentService,
	AttachmentServiceHooks,
};
