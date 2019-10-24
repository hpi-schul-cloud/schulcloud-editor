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

module.exports = {
	dataToSetQuery,
	convertSuccessMongoPatchResponse,
};
