/* eslint-disable no-param-reassign */
const { BadRequest } = require('@feathersjs/errors');

const restricted = (context) => {
	context.params.query.users = context.params.user;
	return context;
};

const restrictedToOwner = (context) => {
	context.params.query.owner = context.params.user;
	return context;
};

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
	find: [restricted],
	get: [restricted],
	create: [created],
	update: [restrictedToOwner],
	patch: [restrictedToOwner],
	remove: [restrictedToOwner],
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
