/* eslint-disable no-param-reassign */
const { forceOwnerInData, block } = require('../../../global/hooks');
const {
	isMemberOf, getSessionUser, isInGroup, createId, createGroupsInData,
} = require('../../../global/collection');
const { LessonModel, getLesson } = require('../../models');

/**
 * Is enable later for more complex usecases if it needed.
 * In first step the database model result is simplyfy with this hook.
 */
const reduceToOwnSection = (context) => {
	context.result.steps = context.result.steps.map((step) => {
		// eslint-disable-next-line prefer-destructuring
		step.sections = step.sections[0] || null;	// array to own element
		return step;
	});
	return context;
};

const addLessonId = (context) => {
	context.data._id = createId();
	return context;
};

const addNewGroups = context => createGroupsInData(context, context.data._id, ['owner', 'users']);

/**
 * Can only save use in get and find operations.
 */
const restrictedAfter = (context) => {
	const user = getSessionUser(context);
	if (context.result.data) {
		const groups = [];
		context.result.data.forEach((lesson) => {
			groups.push(lesson.users);
			groups.push(lesson.owner);
		});
		isMemberOf(groups, user, true);
	} else {
		const { users, owner } = context.result;
		isMemberOf([users, owner], user, true);
	}

	return context;
};

/**
 * If not visible remove steps for not owners
 */
const removeSteps = (context) => {
	const user = getSessionUser(context);
	const { owner, steps } = context.result;
	const isMember = isInGroup(owner, user);
	if (isMember === false) {
		context.result.steps = steps.filter(step => step.visible === true);
	}
	return context;
};

const restrictedOwner = async (context) => {
	const user = getSessionUser(context);
	const { owner } = await getLesson(context.id);
	isMemberOf([owner], user, true);
	return context;
};

const removeEmptySteps = async (context) => {
	const id = context.result._id;
	let changes = false;
	// set emptys steps to undefined and detect changes.
	let steps = context.result.steps.map((step) => {
		if (step.sections === null || (step.sections || []).length <= 0) {
			changes = true;
			return undefined;
		}
		return step;
	});
	// If any changes is detected, then remove undefineds and update Lesson.
	// The return value do not wait if update is finish.
	if (changes === true) {
		steps = steps.filter(step => step);
		LessonModel.findByIdAndUpdate(id, { $set: { steps } }).exec((err) => {
			if (err) {
				throw new Error('Can not patch lesson steps', err);
			}
		});
		context.result.steps = steps;
	}

	return context;
};

exports.before = {
	all: [],	// populate(['steps.sections', 'users', 'owner'])
	find: [],
	get: [],	// restricted(['owner', 'users'], 'users'),
	create: [addLessonId, forceOwnerInData, addNewGroups],
	update: [block],
	patch: [restrictedOwner],
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
