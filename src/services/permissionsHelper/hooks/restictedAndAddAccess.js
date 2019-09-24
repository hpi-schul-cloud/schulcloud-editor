const { Forbidden } = require('@feathersjs/errors');
const { userIsInGroupOrUsers } = require('../utils/');

// todo it is fetch all permission data and select then,
// to reduce traffic it should select only permissions in time.
// add a before hook for it


const isActivated = ({ endDate, publishDate, activated }) => {
	const date = Date.now();
	return activated === true
	&& (date < endDate || endDate === null)
	&& (date > publishDate || publishDate === null);
};

const access = (basePermissions, user, permissionTyp) => {
	const validPermissions = basePermissions.filter(
		perm => perm[permissionTyp] === true && isActivated(perm),
	);

	return userIsInGroupOrUsers(validPermissions, user.id);
};

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
		write: access(basePermissions, user, 'write'),
		read: access(basePermissions, user, 'read'),
	};

	if (params.access.write || params.access.read) {
		return context;
	}
	throw new Forbidden('You have no access.');
};

module.exports = restictedAndAddAccess;
