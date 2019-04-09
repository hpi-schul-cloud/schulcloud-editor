const { forceOwnerInData, block } = require('../../global').hooks;
const {
	addLessonId,
	addNewGroups,
	restrictedAfter,
	removeHiddenSteps,
	restrictedOwner,
	patchGroupIfArrayHook,
} = require('./hooks');

exports.before = {
	all: [],
	find: [],
	get: [],
	create: [addLessonId, forceOwnerInData, addNewGroups],
	update: [block],
	patch: [restrictedOwner, patchGroupIfArrayHook],
	remove: [restrictedOwner],
};

exports.after = {
	all: [],
	find: [restrictedAfter],
	get: [restrictedAfter, removeHiddenSteps],
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
