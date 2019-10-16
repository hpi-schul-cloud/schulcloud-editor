/**
 * Create a copy from params with all user informations
 * But is is marked the params as intern request.
 * It clear the requested query and add deletedAt: { $exists: false };
 * @param {*} params
 * @return params
 */
const prepareParams = (params) => {
	const copy = Object.assign({}, params);
	copy.query = {
		deletedAt: undefined,
	};
	copy.provider = undefined;
	return copy;
};


const modifiedParamsToReturnPatchResponse = (params) => {
	if (!(typeof params.mongoose === 'object')) {
		params.mongoose = {};
	}
	params.mongoose.writeResult = true;
	return params;
};

module.exports = {
	prepareParams,
	modifiedParamsToReturnPatchResponse,
};
