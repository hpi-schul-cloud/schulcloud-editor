const { GeneralError, BadRequest, Forbidden } = require('@feathersjs/errors');
/* eslint-disable class-methods-use-this */
const { convertParamsToInternRequest } = require('../../global/helpers');

const { filterOutResults } = require('../../global/hooks');
const { PermissionModel } = require('./models');
const hooks = require('./hooks');
const addReferencedData = require('./hooks/addReferencedData');
const baseServicesAccess = require('./hooks/baseServicesAccess');
const restictedAndAddAccess = require('./hooks/restictedAndAddAccess');

class PermissionService {
	constructor(options = {}) {
		this.docs = options.docs;
		this.baseServiceName = options.baseService;
		this.permissionKey = options.permissionKey;
		this.err = {
			create: 'Can not create new permission.',
			// noAccess: 'You have no access.',
		};
	}

	/**
	 * Create new embedded permissions for a user, or group.
	 * @param {*} data
	 * @param {*} params
	 */
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

	/**
	 * Return data from base data.
	 * @param {*} userId
	 * @param {*} params
	 */
	async get(permissionId, params) {
		return params.basePermissions.filter(perm => perm._id.toString() === permissionId);
	}

	/**
	 * Return all permissions for data.
	 * @param {*} params
	 */
	async find(params) {
		const { basePermissions, access } = params;
		// paginate and add additional information over access for proxy service
		return {
			total: basePermissions.length,
			limit: params.$limit || 1000,
			skip: params.$skip || 0,
			data: basePermissions,
			access,
		};
	}

	async remove(permissionId, params) {
		const { baseService, baseId, basePermissions } = params;
		const newPermissions = basePermissions.filter(
			perm => perm._id.toString() !== permissionId.toString(),
		);
		// todo slice mongoose operations
		await baseService.patch(baseId, { [this.permissionKey]: newPermissions },
			convertParamsToInternRequest(params))
			.catch((err) => {
				throw new GeneralError(this.err.create, err);
			});
	}

	async patch(params) {
		// todo 
		return {};
	}

	setup(app) {
		this.app = app;
	}
}

class Proxy {
	constructor(options = {}) {
		this.docs = options.docs;
		this.permissionServicesName = options.path;
		this.permission = options.permission;
		this.err = {
			others: 'You have no access to request other users.',
		};
	}

	async get(userId, params) {
		// @override params for requested user
		// 1. alle permissions
		// 2. anfragender user hat berechtigung
		// 2. -> read dann nur für sich selbst
		// 2. -> write dann für andere nutzer auch
		// evtl. params umbiegen
		// params.user = userId;
		// params.userId = userId;
		// Ergebnis (path access) auf permission prüfen
		// const { ressourceId } = params.route;
		const requestOther = params.user.id !== userId;
		try {
			const {
				data: permissions, access,
			} = await this.app.service(this.permissionServicesName).find(params);

			if (requestOther) {
				// Has no write permissions. Can not request other users.
				if (!access.write) {
					throw new Forbidden(this.err.others);
				}
				const { params: { access: accessOther } } = restictedAndAddAccess({
					params: {
						basePermissions: permissions,
						user: userId,
						provider: 'rest',
					},
				});
				return { access: accessOther[this.permission] };
			}

			return { access: access[this.permission] };
		} catch (error) {
			return { access: false, error };
		}
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = function setup(app) {
	const { baseService, permissionKey = 'permissions' } = this;
	const pathMin = `${baseService}/:ressourceId`;
	const path = `${pathMin}/permission`;

	app.use(path, new PermissionService({
		baseService,
		permissionKey,
	}));

	hooks.before.all.unshift(addReferencedData(baseService, permissionKey));

	const permissionService = app.service(path);
	permissionService.hooks(hooks);

	app.use(`${pathMin}/write`, new Proxy({
		path,
		permission: 'write',
	}));

	app.use(`${pathMin}/read`, new Proxy({
		path,
		permission: 'read',
	}));


	const serviceToModified = app.service(baseService);
	['create', 'find', 'get', 'patch', 'remove', 'update'].forEach((method) => {
		// add after filter that remove the embedded permissions in baseServices
		serviceToModified.__hooks.after[method].push(filterOutResults(permissionKey));
		// add access check in baseServices as first place in before all
		const access = ['get', 'find'].includes(method) ? 'read' : 'write';
		serviceToModified.__hooks.before[method].unshift(baseServicesAccess(pathMin, access));
	});


	app.logger.info(`Permission services is adding add ${path} with key ${permissionKey}.`);
};
