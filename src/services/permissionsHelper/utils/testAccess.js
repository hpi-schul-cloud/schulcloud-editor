const isActivated = require('./isActivated');
const { userIsInGroupOrUsers } = require('./userIsInGroupOrUsers');

const access = (basePermissions, user, permissionTyp) => {
	const validPermissions = basePermissions.filter(
		perm => perm[permissionTyp] === true && isActivated(perm),
	);

	return userIsInGroupOrUsers(validPermissions, user.id);
};

module.exports = access;
