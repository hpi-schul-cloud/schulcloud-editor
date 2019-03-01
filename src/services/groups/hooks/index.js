/* eslint-disable no-param-reassign */
const { BadRequest } = require('@feathersjs/errors');

const { isArray, addIdIfNotExist } = require('../../../global/collection');
const { restricted, block, forceUserToOwner } = require('../../../global/hooks');

const addCurrentUser = (context) => {
	const users = context.data.users || [];

	if (!isArray(users)) {
		throw new BadRequest('The value data.users must be an Array.');
	}

	context.data.users = addIdIfNotExist(users, context.params.user);
	return context;
};

exports.before = {
	all: [],
	find: [restricted('users')],
	get: [restricted('users')],
	create: [forceUserToOwner, addCurrentUser],
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
