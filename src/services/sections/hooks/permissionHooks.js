const { block } = require('../../global').hooks;

exports.before = {
	all: [],
	find: [block],
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
