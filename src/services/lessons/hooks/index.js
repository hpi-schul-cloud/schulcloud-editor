const { block, filterOutResults } = require('../../../global/hooks');

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
	all: [filterOutResults('permissions')],
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
