const restictedExternAccess = require('./restictedExternAccess');

exports.before = {
	all: [],
	find: [restictedExternAccess],
	get: [],
	create: [restictedExternAccess],
	update: [],
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
