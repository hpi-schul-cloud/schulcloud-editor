/* eslint-disable class-methods-use-this */
const { GeneralError, BadRequest } = require('@feathersjs/errors');

const { copyParams } = require('../../global/utils');
const { PermissionModel } = require('./models');

const {
	limitDataViewForReadAccess,
	restictedAndAddAccess,
} = require('./hooks');

const permissionServiceHooks = {};
permissionServiceHooks.before = {
	all: [restictedAndAddAccess, limitDataViewForReadAccess],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};


class PermissionService {
	constructor(options = {}) {
		this.docs = options.docs;
		this.baseServiceName = options.baseService;
		this.permissionKey = options.permissionKey;
		this.err = {
			create: 'Can not create new permission.',
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
			copyParams(params))
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
			copyParams(params))
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

module.exports = {
	PermissionService,
	permissionServiceHooks,
};
