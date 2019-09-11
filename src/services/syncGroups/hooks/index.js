const { block } = require('../../../global/hooks');
const mapUserIds = require('./mapUserIds');

exports.before = {
	all: [],
	find: [],
	get: [],
	create: [mapUserIds],
	update: [block],
	patch: [mapUserIds],
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
