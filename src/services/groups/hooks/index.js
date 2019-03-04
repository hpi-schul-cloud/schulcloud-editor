/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */

const { addIdIfNotExist } = require('../../../global/collection');
const { restricted, block, forceOwner } = require('../../../global/hooks');

const addCurrentUser = (context) => {
	context.data.users = addIdIfNotExist(context.data.users, context.params.user);
	return context;
};

exports.before = {
	all: [],
	find: [restricted('users')],
	get: [restricted('users')],
	create: [forceOwner, addCurrentUser],
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
