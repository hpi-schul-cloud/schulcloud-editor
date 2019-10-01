/* eslint-disable class-methods-use-this */
const { BadRequest, Forbidden, NotFound } = require('@feathersjs/errors');
const { disallow } = require('feathers-hooks-common');
const { testAccess } = require('./utils');

const {
	copyParams,
	dataToSetQuery,
	paginate,
	modifiedParamsToReturnPatchResponse,
	convertSuccessMongoPatchResponse,
	permissions,
} = require('../../global/utils');
const { PermissionModel } = require('./models');

const permissionServiceHooks = {};
permissionServiceHooks.before = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [disallow()],
	patch: [],
	remove: [],
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
			noAccess: 'You have no accesss.',
		};
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

	setScope(_params) {
		const params = copyParams(_params);
		params.query.$select = [this.permissionKey];
		params.query.$populate = [{
			path: `${this.permissionKey}.group`,
			select: 'users',
		}];
		return params;
	}

	getOne(permissionList = [], permissionId = '') {
		const perms = permissionList.filter(perm => perm._id.toString() === permissionId);
		if (perms.length <= 0) {
			throw new NotFound();
		}
		return perms[0];
	}

	async getAndCheckPermission(params, permissionId) {
		const { route: { ressourceId }, user } = params;
		const internParams = this.setScope(copyParams(params));
		// all permissions
		const result = await this.app.service(this.modelServiceName)
			.get(ressourceId, internParams);

		const basePermissions = result[this.permissionKey];

		if (permissions.hasWrite(basePermissions, user)) {
			return permissionId ? this.getOne(basePermissions, permissionId) : basePermissions;
		}

		if (!permissions.hasRead(basePermissions)) {
			throw new Forbidden(this.err.noAccess);
		}

		return permissionId ? this.getOne(basePermissions, permissionId) : basePermissions;
	}

	/**
	 * Create new embedded permissions for a user, or group.
	 * @param {*} data
	 * @param {*} params
	 */
	async create(data, params) {
		const { ressourceId } = params.route;

		await this.getAndCheckPermission(params);

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
		return this.getAndCheckPermission(params, permissionId);
	}

	/**
	 * Return all permissions for data.
	 * @param {*} params
	 */
	async find(params) {
		const perms = await this.getAndCheckPermission(params);
		return paginate(perms, params);
	}

	async remove(_id, params) {
		await this.getAndCheckPermission(params, _id);

		const { ressourceId } = params.route;
		const patchParams = modifiedParamsToReturnPatchResponse(copyParams(params));

		const $pull = {
			[this.permissionKey]: { _id },
		};

		return this.app.service(this.modelServiceName).patch(ressourceId, { $pull }, patchParams)
			.then(patchStatus => convertSuccessMongoPatchResponse(patchStatus, { _id }, true))
			.catch((err) => {
				throw new BadRequest(this.err.remove, err);
			});
	}

	async patch(_id, data, params) {
		await this.getAndCheckPermission(params, _id);

		const { ressourceId } = params.route;
		const patchParams = modifiedParamsToReturnPatchResponse(copyParams(params));

		// It is important to map the patch operation in combination with
		// dataToSetQuery(data, `${this.permissionKey}.$.`)
		patchParams.query = {
			[`${this.permissionKey}._id`]: _id,
			$select: { [this.permissionKey]: 1 },
		};

		return this.app.service(this.modelServiceName)
			.patch(ressourceId, dataToSetQuery(data, `${this.permissionKey}.$.`), patchParams)
			.then(patchStatus => convertSuccessMongoPatchResponse(patchStatus, { _id }, true))
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
