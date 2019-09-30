const { testAccess } = require('../services/permissionsHelper/utils');

// models after
const addTypeString = name => (docs, next) => {
	if (!docs) {
		next();
	}
	if (Array.isArray(docs)) {
		docs = docs.map((doc) => {
			doc.type = name;
			return doc;
		});
	} else {
		docs.type = name;
	}

	next();
};

/**
 * Create a copy from params with all user informations
 * But is is marked the params as intern request.
 * It clear the requested query and add deletedAt: { $exists: false };
 * @param {*} params
 * @return params
 */
const copyParams = (params) => {
	const copy = Object.assign({}, params);
	copy.query = {
		deletedAt: undefined,
	};
	copy.provider = undefined;
	return copy;
};

const dataToSetQuery = (data, prefix = '') => {
	const $set = {};
	Object.entries(data).forEach(([key, value]) => {
		$set[`${prefix}${key}`] = value;
	});
	return { $set };
};

/**
 * @param {Object} res {n, nModified, ok}
 * @param {*} [outputData] The return if n === 1 && nModified === 1 && ok === 1
 * @param {Boolean} [throwError=false] If false it return in error case false, otherwise throw an error
 * @error {Boolean || throw res }
 */
const convertSuccessMongoPatchResponse = (res, outputData, throwError = false) => {
	if (res.n === 1 && res.nModified === 1 && res.ok === 1) {
		return outputData || true;
	}
	if (throwError) {
		throw res;
	}
	return false;
};

// eslint-disable-next-line arrow-body-style
const hasReadPermissions = (permissions, user) => {
	return testAccess(permissions, user, 'read') || testAccess(permissions, user, 'write');
};

const hasWritePermissions = (permissions, user) => testAccess(permissions, user, 'write');

module.exports = {
	addTypeString,
	copyParams,
	dataToSetQuery,
	convertSuccessMongoPatchResponse,
	hasWritePermissions,
	hasReadPermissions,
};
