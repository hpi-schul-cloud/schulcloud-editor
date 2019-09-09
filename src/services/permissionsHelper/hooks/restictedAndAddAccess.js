const { Forbidden } = require('@feathersjs/errors');
const { userIsInGroupOrUsers } = require('../util/');

// todo it is fetch all permission data and select then,
// to reduce traffic it should select only permissions in time.
// add a before hook for it


const isActivated = ({ endDate, publishDate, activated }) => {
	const date = Date.now();
	return activated === true
	&& (date < endDate || endDate === null)
	&& (date > publishDate || publishDate === null);
};

const access = (context, permission) => {
	const { basePermissions, user } = context.params;
	const validPermissions = basePermissions.filter(
		perm => perm[permission] === true && isActivated(perm),
	);

	return userIsInGroupOrUsers(validPermissions, user);
};

/**
 * Intern request can pass.
 * @param {*} context
 */
const restictedAndAddAccess = (context) => {
	const { params } = context;
	if (!(params.provider === 'rest')) {
		params.access = {
			write: true,
			read: true,
		};
		return context;
	}
	params.access = {
		write: access(context, 'write'),
		read: access(context, 'read'),
	};

	if (params.access.write || params.access.read) {
		return context;
	}
	throw new Forbidden('You have no access.');
};

module.exports = restictedAndAddAccess;
