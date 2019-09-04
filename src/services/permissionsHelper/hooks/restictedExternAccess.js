const { Forbidden } = require('@feathersjs/errors');

const saveSelect = (base, key, fallbackValue) => {
	try {
		const value = base[key];
		return value;
	} catch (err) {
		return fallbackValue || base;
	}
};

const userIsInside = (users = [], userId) => users.some(id => id.toString() === userId);
const userIsInGroupOrUsers = (permissions, user) => userIsInside(permissions.users, user)
		|| userIsInside(saveSelect(permissions.group, 'users', []), user);

const isActivated = (perm) => {
	const date = Date.now();
	return perm.activated === true
	&& (date < perm.endDate || perm.endDate === null)
	&& (date > perm.publishDate || perm.publishDate === null);
};

const writeAccess = (context) => {
	const { basePermissions, user } = context.params;
	const activatedWritePermissions = basePermissions.filter(
		perm => perm.write === true && isActivated(perm),
	);

	return userIsInGroupOrUsers(activatedWritePermissions, user);
};

const readAccess = (context) => {
	const { basePermissions, user } = context.params;
	const activatedPermissions = basePermissions.filter(
		perm => perm.read === true && isActivated(perm),
	);
	return userIsInGroupOrUsers(activatedPermissions, user);
};

/**
 * Intern request can pass.
 * @param {*} context
 */
const restictedExternAccess = (context) => {
	if (!context.params.provider === 'rest') {
		return context;
	}
	if (context.method === 'get' && readAccess(context)) {
		return context;
	}
	if (writeAccess(context)) {
		return context;
	}
	throw new Forbidden('You have no access.');
};

module.exports = restictedExternAccess;
