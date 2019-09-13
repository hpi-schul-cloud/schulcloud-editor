const { disallow } = require('feathers-hooks-common');
// todo filter should add over permissionHelper
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
