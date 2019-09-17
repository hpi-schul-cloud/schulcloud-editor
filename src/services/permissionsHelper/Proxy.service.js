const { Forbidden } = require('@feathersjs/errors');

const { restictedAndAddAccess } = require('./hooks');

class ProxyService {
	constructor(options = {}) {
		this.docs = options.docs;
		this.permissionServicesName = options.path;
		this.permission = options.permission;
		this.err = {
			others: 'You have no access to request other users.',
		};
	}

	async get(userId, params) {
		const requestOther = params.user !== userId;
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

module.exports = {
	ProxyService,
	proxyServiceHooks: {},
};
