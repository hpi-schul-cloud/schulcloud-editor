const { Forbidden } = require('@feathersjs/errors');
const { copyParams } = require('../../../global/utils');

const addReferencedData = (baseService, permissionKey) => async (context) => {
	const { params, app } = context;
	const { ressourceId } = params.route;

	if (params.query.disabledPatch === true) {
		params.basePermissions = [];
		return context;
	}

	params.query.$select = { [permissionKey]: 1 };
	params.query.$populate = { path: 'group' };

	const baseData = await app.service(baseService).get(ressourceId,
		copyParams(params))
		.catch((err) => {
			throw new Forbidden('You have no access.', err);
		});
	// context.params.baseData = baseData;
	params.basePermissions = baseData[permissionKey]; // todo generic over settings
	return context;
};

module.exports = addReferencedData;
