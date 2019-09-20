/* eslint-disable class-methods-use-this */
const { GeneralError, BadRequest } = require('@feathersjs/errors');
const { disallow } = require('feathers-hooks-common');

const { copyParams } = require('../../global/utils');
const { PermissionModel } = require('./models');

const {
	limitDataViewForReadAccess,
	restictedAndAddAccess,
	restrictedPermWithoutPatch,
	addReferencedData,
} = require('./hooks');

const permissionServiceHooks = {};
permissionServiceHooks.before = {
	all: [restictedAndAddAccess],
	find: [limitDataViewForReadAccess],
	get: [limitDataViewForReadAccess],
	create: [restrictedPermWithoutPatch],
	update: [disallow()],
	patch: [limitDataViewForReadAccess],
	remove: [limitDataViewForReadAccess],
};


class PermissionService {
	constructor(options = {}) {
		this.docs = options.docs;
		this.baseServiceName = options.baseService;
		this.permissionKey = options.permissionKey;
		this.modelServiceName = options.modelService;
		this.err = {
			create: 'Can not create new permission.',
		};

		permissionServiceHooks.before.all.unshift(addReferencedData(this.modelServiceName, this.permissionKey));
	}

	/**
	 * Create new embedded permissions for a user, or group.
	 * @param {*} data
	 * @param {*} params
	 */
	async create(data, params) {
		const { ressourceId } = params.route;
		const { _doc: newPermission, errors } = new PermissionModel(data);
		if (errors || !newPermission) {
			throw new BadRequest(this.err.create, errors || {});
		}

		/*
			it is for intern request if the base ressource is created at same time
			 and no patch operation can execute
			 (bescouse ressource do not exist in this moment)
		*/
		if (params.query.disabledPatch === true) {
			return newPermission;
		}

		const patchData = {
			$push: {
				[this.permissionKey]: newPermission,
			},
		};

		return this.app.service(this.modelServiceName)
			.patch(ressourceId, patchData, copyParams(params))
			.then(() => newPermission)
			.catch((err) => {
				throw new GeneralError(this.err.create, err);
			});
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
		const { ressourceId } = params.route;

		const query = {
			$pull: {
				[`${this.permissionKey}._id`]: permissionId,
			},
		};
		const internParams = copyParams(params);
		internParams.query.$select._id = 1;
		// todo soft delete ?
		return this.app.service(this.modelServiceName).patch(ressourceId, query, internParams)
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
