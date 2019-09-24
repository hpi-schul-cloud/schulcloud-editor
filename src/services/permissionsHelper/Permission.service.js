/* eslint-disable class-methods-use-this */
const { GeneralError, BadRequest, NotImplemented } = require('@feathersjs/errors');
const { disallow } = require('feathers-hooks-common');

const { copyParams } = require('../../global/utils');
const { PermissionModel } = require('./models');

const {
	limitDataViewForReadAccess,
	restictedAndAddAccess,
	addReferencedData,
} = require('./hooks');

const permissionServiceHooks = {};
permissionServiceHooks.before = {
	all: [restictedAndAddAccess],
	find: [limitDataViewForReadAccess],
	get: [limitDataViewForReadAccess],
	create: [],
	update: [disallow()],
	patch: [limitDataViewForReadAccess],
	remove: [limitDataViewForReadAccess],
};


class PermissionService {
	constructor({
		baseService, docs = {}, permissionKey, modelService, permissionUri,
	}) {
		this.docs = docs;
		this.baseServiceName = baseService;
		this.permissionKey = permissionKey;
		this.modelService = modelService;
		this.permissionUri = permissionUri;

		this.err = {
			create: 'Can not create new permission.',
			createObject: 'Can not create new permission object.',
			createDefault: 'Can not create default permissions.',
		};

		permissionServiceHooks.before.all.unshift(addReferencedData(this.modelService, this.permissionKey));
	}

	/**
	 * @public
	 */
	async createDefaultPermissionsData(defaultGroups = []) {
		try {
			const promises = defaultGroups.map(({ _id, permission }) => this.createPermissionObject({
				group: _id,
				[permission]: true,
				activated: true,
			}));
			return Promise.all(promises);
		} catch (err) {
			const errorObj = new BadRequest(this.err.createDefault, err);
			this.app.logger.error(errorObj);
			throw errorObj;
		}
	}

	/**
		it is for intern request if the base ressource is created at same time
		and no patch operation can execute
		(bescouse ressource do not exist in this moment)
	*	@public
	*/
	async createPermissionObject(data) {
		const { _doc: newPermission, errors } = new PermissionModel(data);
		if (errors || !newPermission) {
			const errorObj = new BadRequest(this.err.createObject, errors || {});
			this.app.logger.error(errorObj);
			throw errorObj;
		}
		return newPermission;
	}

	/**
	 * Create new embedded permissions for a user, or group.
	 * @param {*} data
	 * @param {*} params
	 */
	async create(data, params) {
		const { ressourceId } = params.route;
		const newPermission = await PermissionService.createPermissionObject(data);
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
		throw new NotImplemented();
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	PermissionService,
	permissionServiceHooks,
};
