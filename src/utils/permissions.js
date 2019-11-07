const saveSelect = (base, key, fallbackValue) => {
	try {
		const value = base[key];
		return value;
	} catch (err) {
		return fallbackValue || base;
	}
};

const userIsInside = (users = [], userId) => users.some(id => id.toString() === userId.toString());
const isInUsers = (permissions = [], userId) => permissions.some(perm => userIsInside(perm.users, userId));
// eslint-disable-next-line max-len
const isInGroup = (permissions = [], userId) => permissions.some(perm => userIsInside(saveSelect(perm.group, 'users', []), userId));
const userIsInGroupOrUsers = (permissions, userId) => {
	if (!userId) {
		return false;
	}
	if (!Array.isArray(permissions)) {
		// eslint-disable-next-line no-param-reassign
		permissions = [permissions];
	}
	return isInUsers(permissions, userId)
	|| isInGroup(permissions, userId);
};

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
 * Aggregated helpers please use this helpers for save check. Be carfull if you use the basic helpers.
 */

/**
 * @ref permissions
 */
const hasRead = (permissions, user) => access(permissions, user, 'read') || access(permissions, user, 'write');

/**
 * @param {*} permissions
 */
const couldAnyoneOnlyRead = permissions => permissions.some(permission => permission.read);

/**
 * @ref permissions
 */
const hasWrite = (permissions, user) => access(permissions, user, 'write');

/**
 * @ref permissions
 */
const filterHasRead = (ressources = [], user, key = 'permissions') => ressources.filter(r => hasRead(r[key], user));

/**
 * @ref permissions
 */
const filterHasWrite = (ressources = [], user, key = 'permissions') => ressources.filter(r => hasWrite(r[key], user));


module.exports = {
	saveSelect,
	userIsInside,
	isInUsers,
	isInGroup,
	userIsInGroupOrUsers,
	isActivated,
	access,
	hasWrite,
	hasRead,
	couldAnyoneOnlyRead,
	filterHasRead,
	filterHasWrite,
};
