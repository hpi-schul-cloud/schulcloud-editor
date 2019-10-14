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
const isInUsers = (permissions, userId) => permissions.some(perm => userIsInside(perm.users, userId));
const isInGroup = (permissions, userId) => permissions.some(perm => userIsInside(saveSelect(perm.group, 'users', []), userId));
const userIsInGroupOrUsers = (permissions, userId) => {
	if (!userId) {
		return false;
	}
	if (!Array.isArray(permissions)) {
		permissions = [permissions];
	}
	return isInUsers(permissions, userId)
	|| isInGroup(permissions, userId);
};

module.exports = {
	saveSelect,
	userIsInside,
	isInUsers,
	isInGroup,
	userIsInGroupOrUsers,
};
