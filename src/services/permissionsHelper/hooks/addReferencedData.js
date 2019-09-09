const { Forbidden } = require('@feathersjs/errors');
const { convertParamsToInternRequest } = require('../../../global/helpers');

const addReferencedData = (baseService, permissionKey) => async (context) => {
	const { params, app } = context;
	const { ressourceId } = params.route;

	params.query.$select = { [permissionKey]: 1 };
	params.query.$populate = { path: 'group' };

	const baseData = await app.service(baseService).get(ressourceId,
		convertParamsToInternRequest(params))
		.catch((err) => {
			throw new Forbidden('You have no access.', err);
		});

	params.baseId = ressourceId;
	params.baseService = app.service(baseService);
	// context.params.baseData = baseData;
	params.basePermissions = baseData[permissionKey]; // todo generic over settings
	return context;
};

module.exports = addReferencedData;
