/* eslint-disable arrow-body-style */
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

/**
 * @ref permissions
 */
const hasRead = (permissions, user) => {
	return testAccess(permissions, user, 'read') || testAccess(permissions, user, 'write');
};

/**
 * @ref permissions
 */
const hasWrite = (permissions, user) => testAccess(permissions, user, 'write');

/**
 * @ref permissions
 */
const filterHasRead = (ressources = [], user, key = 'permissions') => {
	return ressources.filter(r => hasRead(r[key], user));
};

/**
 * @ref permissions
 */
const filterHasWrite = (ressources = [], user, key = 'permissions') => {
	return ressources.filter(r => hasWrite(r[key], user));
};

module.exports = {
	addTypeString,
	copyParams,
	dataToSetQuery,
	convertSuccessMongoPatchResponse,
	permissions: {
		hasRead,
		hasWrite,
		filterHasRead,
		filterHasWrite,
	},
};
