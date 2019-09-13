const { userIsInGroupOrUsers } = require('../utils/');

const limitDataViewForReadAccess = (context) => {
	const { params } = context;
	const { basePermissions, access, user } = params;
	// has no write permissions, limit access to current user related permissions
	if (!access.write) {
		params.basePermissions = basePermissions.filter(perm => userIsInGroupOrUsers(perm, user));
	}
	return context;
};

module.exports = limitDataViewForReadAccess;
