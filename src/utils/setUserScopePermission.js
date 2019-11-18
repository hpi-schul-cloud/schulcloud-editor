const { hasWrite } = require('./permissions');
const { isPaginated } = require('./pagination');

const KEY_NAME = 'scopePermission'; // is forced by this utils

/**
 * For every request it should return also the user scope, forced over this util.
 * @param {ResultObject} result The request result, that should modified.
 * @param {String ||  Array::Permission} permissions
 * @param {String} permissionsAsString It is set directly for example in create request 'write'.
 * @param {Array::Permission} permissionsAsArrayOfObjects To check the user scoped permissions and set it.
 * @param {User} user The user object to set the permission scope.
 * @returns {ResultObject}
 */
const setUserScopePermission = (result, permissions, user) => {
	if (Array.isArray(permissions) && user) {
		let perm = 'read';
		if (hasWrite(permissions, user)) {
			perm = 'write';
		}
		result[KEY_NAME] = perm;
	} else if (typeof permissions === 'string') {
		result[KEY_NAME] = permissions;
	} else {
		throw new Error('Wrong permissions or user add to setScopePermission', { permissions, user });
	}
	return result;
};

/**
 * For every request it should return also the user scope, forced over this util.
 * This is only for paginated find results, please use setUserScopePermission for other requests.
 * !!! Is expensiv operation at the moment. !!!
 * @param {PaginatedResultObject||Array::ResultObject} paginatedResult The request result, that should modified.
 * @param {Array::Permission} permissions
 * @param {User} user The user object to set the permission scope.
 * @returns {PaginatedResultObject||Array::ResultObject}
 */
const setUserScopePermissionForFindRequests = (result, user, key = 'permissions') => {
	let data;
	const paginatedBoolean = isPaginated(result);
	if (paginatedBoolean) {
		({ data } = result);
	} else {
		data = result;
	}

	if (!Array.isArray(data)) {
		throw new Error('The result is not valid input for setUserScopePermissionForFindRequests.', result);
	}

	// todo find less expensiv operations
	data = data.map(res => setUserScopePermission(res, res[key], user));

	if (paginatedBoolean) {
		result.data = data;
		return result;
	}
	return data;
};

module.exports = {
	setUserScopePermission,
	setUserScopePermissionForFindRequests,
	KEY_NAME,
};
