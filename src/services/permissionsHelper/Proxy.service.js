const { Forbidden } = require('@feathersjs/errors');
const { copyParams } = require('../../global/utils');
const { restictedAndAddAccess } = require('./hooks');
const { userIsInGroupOrUsers } = require('./utils');

class ProxyService {
	constructor({
		docs = {}, path, permission, modelService,
	}) {
		this.docs = docs;
		this.permissionServicesName = path;
		this.permission = permission;
		this.modelService = modelService;
		this.err = {
			others: 'You have no access to request other users.',
		};
	}

	checkPermission(_access) {
		const access = _access.write === true ? true : _access.read;
		return { access };
	}

	async get(userId, params) {
		const { user } = params;
		const requestOther = user.id !== userId;
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
						user,
						provider: 'rest',
					},
				});
				return this.checkPermission(accessOther); // { access: accessOther[this.permission] };
			}

			return this.checkPermission(access); // { access: access[this.permission] };
		} catch (error) {
			return { access: false, error };
		}
	}

	async find(_params) {
		const date = Date.now();
		const { user } = _params;
		// copy params and clear query (!)
		const params = copyParams(_params);

		// populate and select related data
		params.query.$select = [];
		params.query.$select.push({
			permissions: 1,
			_id: 1,
		});

		params.query.$populate = [];
		params.query.$populate.push({
			path: 'permissions.group', // todo get permission key
			select: 'users',
		});

		// do not fetch not activated ressources
		params.query.$and = [];
		params.query.$and.push({
			$or: [
				{ publishDate: null },
				{ publishDate: { $gt: date } },
			],
		});
		params.query.$and.push({
			$or: [
				{ endDate: null },
				{ endDate: { $lte: date } },
			],
		});
		params.query.$and.push({
			'permissions.activated': true, // todo get key
		});

		// show if user is in group or users, 
		// that is implicit a read condition, becouse only active permission rules are fetched
		const { data: allRessources } = await this.app.service(this.modelService).find(params);
		const userRessource = allRessources.filter(r => userIsInGroupOrUsers(r.permissions, user.id));
		const data = userRessource.map(r => ({
			_id: r._id,
			access: true,
		}));
		// fake pagination, todo write helper for it
		return {
			total: userRessource.length,
			limit: params.query.$limit || 1000,
			skip: params.query.$skip || 0,
			data,
		};
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	ProxyService,
	proxyServiceHooks: {},
};
