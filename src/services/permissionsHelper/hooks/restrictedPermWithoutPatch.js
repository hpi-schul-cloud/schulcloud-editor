const { Forbidden } = require('@feathersjs/errors');

const restrictedPermWithoutPatch = (context) => {
	const { query, provider } = context.params;
	if (!query.disabledPatch && provider === 'rest') {
		throw new Forbidden('You have no access.');
	}
	return context;
};

module.exports = restrictedPermWithoutPatch;
