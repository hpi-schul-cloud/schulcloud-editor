const { Forbidden } = require('@feathersjs/errors');
const { copyParams } = require('../../../global/utils');

const addReferencedData = (baseModelService, permissionKey) => async (context) => {
	const { params, app } = context;
	const { ressourceId } = params.route;
	const internParams = copyParams(params);

	const goupPath = `${permissionKey}.group`;

	internParams.query.$select = {
		[permissionKey]: 1,
	};
	internParams.query.$populate = [
		{ path: goupPath, select: 'users' },
	];

	const baseData = await app.service(baseModelService).get(ressourceId, internParams)
		.catch((err) => {
			throw new Forbidden('You have no access.', err);
		});

	params.basePermissions = baseData[permissionKey]; // todo generic over settings
	return context;
};

module.exports = addReferencedData;
