const { block } = require('../../../global/hooks');
// todo filter should add over permissionHelper
exports.before = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [block],
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
