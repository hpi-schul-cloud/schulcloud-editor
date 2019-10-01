const { disallow } = require('feathers-hooks-common');

exports.before = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [disallow()],
	patch: [],
	remove: [],
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
