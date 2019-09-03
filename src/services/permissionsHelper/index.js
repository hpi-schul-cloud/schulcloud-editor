const { Forbidden, GeneralError, BadRequest } = require('@feathersjs/errors');
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const { convertParamsToInternRequest } = require('../../global/helpers');
const { PermissionModel } = require('./models');
const hooks = require('./hooks');

const addReferencedData = (baseService, permissionKey) => async (context) => {
	const { params, app } = context;
	const { ressourceId } = params.route;
	params.query.$select = { [permissionKey]: 1 };
	params.query.$populate = { path: 'group' };
	const baseData = await app.service(baseService).get(ressourceId,
		convertParamsToInternRequest(params))
		.catch((err) => {
			throw new Forbidden('You have no access.', err);
		});

	context.params.baseId = ressourceId;
	context.params.baseService = app.service(baseService);
	context.params.basePermissions = baseData[permissionKey]; // todo generic over settings
	return context;
};

class PermissionService {
	constructor(options = {}) {
		this.docs = options.docs;
		this.baseServiceName = options.baseService;
		this.permissionKey = options.permissionKey;
		this.err = {
			create: 'Can not create new permission.',
			noAccess: 'You have no access.',
		};
	}

	async create(data, params) {
		const { _doc: newPermission, errors } = new PermissionModel(data);
		if (errors || !newPermission) {
			throw new BadRequest(this.err.create, errors || {});
		}

		const { baseService, baseId, basePermissions } = params;
		basePermissions.push(newPermission);
		await baseService.patch(baseId, { [this.permissionKey]: basePermissions },
			convertParamsToInternRequest(params))
			.catch((err) => {
				throw new GeneralError(this.err.create, err);
			});
		return newPermission;
	}

	userIsInside(users = [], userId) {
		return users.some(id => id.toString() === userId);
	}

	async get(userId, { basePermissions }) {
		const userIncludedPermissions = basePermissions.filter(
			perm => this.userIsInside(perm.users, userId)
			|| this.userIsInside((perm.group || {}).users, userId),
		);
		if (userIncludedPermissions.length <= 0) {
			throw new Forbidden(this.err.noAccess);
		}
		return userIncludedPermissions;
	}

	async find(params) {
		return params.basePermissions;
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = function setup(app) {
	const { baseService, permissionKey = 'permissions' } = this;
	const path = `${baseService}/:ressourceId/permission`;

	app.use(path, new PermissionService({
		baseService,
		permissionKey,
	}));

	hooks.before.all.unshift(addReferencedData(baseService, permissionKey));
	const permissionService = app.service(path);
	permissionService.hooks(hooks);

	const serviceToModified = app.service(baseService);
	

	app.logger.info(`Permission services is adding add ${path} with key ${permissionKey}.`);
};
