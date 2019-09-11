const { BadRequest } = require('@feathersjs/errors');

const mapUserIds = (context) => {
	if (!context.data) {
		return context;
	}
	const { userNames } = context.data;
	if (Array.isArray(userNames) && userNames[0].id && typeof userNames[0].name) { // todo validation Schema?
		context.data.users = userNames.map(u => u.name);
		return context;
	}
	throw new BadRequest('The key userNames must exist. User must defined with {id, name}');
};

module.exports = mapUserIds;
