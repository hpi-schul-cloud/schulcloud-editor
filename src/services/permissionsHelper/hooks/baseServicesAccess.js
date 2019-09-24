const { Forbidden } = require('@feathersjs/errors');
const { copyParams } = require('../../../global/utils');

const baseServicesAccess = path => async (context) => {
	const { params, app, method } = context;
	if (!(params.provider === 'rest')) {
		return context;
	}


	if (method === 'find') {
		const { data: ressources } = await app.service(path).find(Object.assign({}, params));
		const newParams = copyParams(params);
		if (!(Array.isArray(params.query.$or))) { // todo move to validate query or force array
			newParams.query.$or = [];
		}
		ressources.forEach(({ _id }) => {
			newParams.query.$or.push({ _id });
		});
		context.params = newParams;
		return context;
	}

	copyParams.route.ressourceId = context.id;
	const { access } = await app.service(path).get(params.user.id, Object.assign({}, params));
	if (access === true) {
		return context;
	}

	throw new Forbidden('You have no access.');
};

module.exports = baseServicesAccess;
