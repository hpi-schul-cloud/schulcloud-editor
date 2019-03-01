/* eslint-disable no-param-reassign */
const { BadRequest } = require('@feathersjs/errors');

const { restricted, block } = require('../../../global/hooks');

const created = (context) => {
	const users = context.data.users || [];
	const { user } = context.params;

	if (!Array.isArray(users)) {
		throw new BadRequest('The value data.users must be an Array.');
	}

	if (!users.includes(user)) {
		users.push(user);
	}

	context.data = {
		users,
		owner: user,
	};

	return context;
};

exports.before = {
	all: [],
	find: [restricted('users')],
	get: [restricted('users')],
	create: [created],
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
