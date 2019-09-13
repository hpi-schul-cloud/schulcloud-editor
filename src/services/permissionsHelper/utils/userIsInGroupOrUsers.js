/* eslint-disable no-param-reassign */
const saveSelect = (base, key, fallbackValue) => {
	try {
		const value = base[key];
		return value;
	} catch (err) {
		return fallbackValue || base;
	}
};

const userIsInside = (users = [], userId) => users.some(id => id.toString() === userId.toString());
const IsInUsers = (permissions, user) => permissions.some(perm => userIsInside(perm.users, user));
const IsInGroup = (permissions, user) => permissions.some(perm => userIsInside(saveSelect(perm.group, 'users', []), user));
const userIsInGroupOrUsers = (permissions, user) => {
	if (!Array.isArray(permissions)) {
		permissions = [permissions];
	}
	return IsInUsers(permissions, user)
	|| IsInGroup(permissions, user);
};

module.exports = userIsInGroupOrUsers;
