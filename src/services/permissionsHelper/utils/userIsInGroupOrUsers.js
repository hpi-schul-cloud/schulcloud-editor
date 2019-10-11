/* eslint-disable max-len */
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
const IsInUsers = (permissions, userId) => permissions.some(perm => userIsInside(perm.users, userId));
const IsInGroup = (permissions, userId) => permissions.some(perm => userIsInside(saveSelect(perm.group, 'users', []), userId));
const userIsInGroupOrUsers = (permissions, userId) => {
	if (!userId) {
		return false;
	}
	if (!Array.isArray(permissions)) {
		permissions = [permissions];
	}
	return IsInUsers(permissions, userId)
	|| IsInGroup(permissions, userId);
};

module.exports = {
	saveSelect,
	userIsInside,
	IsInUsers,
	IsInGroup,
	userIsInGroupOrUsers,
};
