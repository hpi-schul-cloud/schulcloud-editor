const { block } = require('../../../global/hooks.js');

exports.before = {
	all: [],
	find: [block],
	get: [],
	create: [],
	update: [block],
	patch: [block],
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
