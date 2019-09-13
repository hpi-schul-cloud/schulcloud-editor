const { Forbidden } = require('@feathersjs/errors');

const baseServicesAccess = (shortPath, testedAccess) => async (context) => {
	const { params, app } = context;
	if (!(params.provider === 'rest')) {
		return context;
	}
	const path = `${shortPath}/${testedAccess}`;
	const copyParams = Object.assign({}, params);
	copyParams.route.ressourceId = context.id;
	const { access } = await app.service(path).get(params.user.id, copyParams);
	if (!access) {
		throw new Forbidden('You have no access.');
	}
	return context;
};

module.exports = baseServicesAccess;
