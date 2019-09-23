const { Forbidden } = require('@feathersjs/errors');

const { restictedAndAddAccess } = require('./hooks');

class ProxyService {
	constructor({ docs = {}, path, permission }) {
		this.docs = docs;
		this.permissionServicesName = path;
		this.permission = permission;
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

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	ProxyService,
	proxyServiceHooks: {},
};
