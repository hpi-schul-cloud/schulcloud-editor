const { Forbidden } = require('@feathersjs/errors');
const { testAccess } = require('../utils/');

/**
 * Intern request can pass.
 * @param {*} context
 */
const restictedAndAddAccess = (context) => {
	const { params } = context;
	const { basePermissions, user } = params;

	if (!(params.provider === 'rest')) {
		params.access = {
			write: true,
			read: true,
		};
		return context;
	}

	if (!user) {
		throw new Forbidden('You have no access.', { message: 'User not exist' });
	}
	params.access = {
		write: testAccess(basePermissions, user, 'write'),
		read: testAccess(basePermissions, user, 'read'),
	};

	if (params.access.write || params.access.read) {
		return context;
	}
	throw new Forbidden('You have no access.');
};

module.exports = restictedAndAddAccess;
