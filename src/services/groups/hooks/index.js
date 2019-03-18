/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */

const { addIdIfNotExist, getSessionUser } = require('../../../global/collection');
const { block, forceOwnerInData } = require('../../../global/hooks');

const addCurrentUser = (context) => {
	context.data.users = addIdIfNotExist(context.data.users, context.params.user);
	return context;
};

const restricted = (restricts = 'owner') => (context) => {
	const user = getSessionUser(context);
//	if (typeof restricts === 'string') {
		context.params.query[restricts] = user;
/*	} else if (isArray(restricts)) {
		if (!context.params.query.$or) {
			context.params.query.$or = [];
		}
		restricts.forEach((key) => {
			context.params.query.$or.push({ [key]: user });
		});
	} */
	return context;
};

exports.before = {
	all: [],
	find: [restricted('users')],
	get: [restricted('users')],
	create: [forceOwnerInData, addCurrentUser],
	update: [block],
	patch: [restricted('users')],
	remove: [restricted('owner')],
};

exports.after = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};

exports.error = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};
