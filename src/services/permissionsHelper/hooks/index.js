const restictedAndAddAccess = require('./restictedAndAddAccess');
const limitDataViewForReadAccess = require('./limitDataViewForReadAccess');

exports.before = {
	all: [restictedAndAddAccess, limitDataViewForReadAccess],
	find: [],
	get: [],
	create: [],
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
