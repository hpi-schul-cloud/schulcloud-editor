/* eslint-disable class-methods-use-this */
const { GeneralError, BadRequest, NotImplemented } = require('@feathersjs/errors');
const { disallow } = require('feathers-hooks-common');

const { copyParams, dataToSetQuery } = require('../../global/utils');
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
		this.modelServiceName = modelService;
		this.permissionUri = permissionUri;

		this.err = {
			create: 'Can not create new permission.',
			createObject: 'Can not create new permission.',
			createDefault: 'Can not create default permissions.',
			patch: 'Can not patch permission.',
			remove: 'Can not remove permission.',
		};

		permissionServiceHooks.before.all.unshift(addReferencedData(this.modelServiceName, this.permissionKey));
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
		const newPermission = await this.createPermissionObject(data);
		const patchData = {
			$push: {
				[this.permissionKey]: newPermission,
			},
		};

		return this.app.service(this.modelServiceName)
			.patch(ressourceId, patchData, copyParams(params))
			.then(() => newPermission)
			.catch((err) => {
				throw new BadRequest(this.err.create, err);
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
		const internParams = copyParams(params);

		const $pull = {
			[this.permissionKey]: { _id: permissionId },
		};

		return this.app.service(this.modelServiceName).patch(ressourceId, { $pull }, internParams)
			.catch((err) => {
				throw new BadRequest(this.err.remove, err);
			});
	}

	async patch(permissionId, _data, params) {
		const { ressourceId } = params.route;
		const internParams = this.setScope(copyParams(params), permissionId);

		internParams.query = {
			[`${this.permissionKey}._id`]: permissionId,
			$select: { [this.permissionKey]: 1 },
		};

		return this.app.service(this.modelServiceName)
			.patch(ressourceId, dataToSetQuery(_data, `${this.permissionKey}.$.`), internParams)
			.then(({ permissions }) => permissions.filter(perm => perm._id.toString() === permissionId)[0])
			.catch((err) => {
				throw new BadRequest(this.err.patch, err);
			});
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	PermissionService,
	permissionServiceHooks,
};
