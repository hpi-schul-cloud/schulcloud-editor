const { forceOwnerInData, block } = require('../../global').hooks;
const {
	reduceToOwnSection,
	addLessonId,
	addNewGroups,
	restrictedAfter,
	removeSteps,
	restrictedOwner,
	removeEmptySteps,
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
	all: [reduceToOwnSection],
	find: [restrictedAfter],
	get: [restrictedAfter, removeSteps],
	create: [],
	update: [],
	patch: [removeEmptySteps],
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
