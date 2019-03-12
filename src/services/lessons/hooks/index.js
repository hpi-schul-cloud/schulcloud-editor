/* eslint-disable no-param-reassign */
const { BadRequest, Forbidden } = require('@feathersjs/errors');
const { forceOwner, block } = require('../../../global/hooks');
const { includeId } = require('../../../global/collection');
const { LessonModel } = require('../../models');

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

const addNewGroups = async (context) => {
	const createGroup = (key) => {
		const users = context.data[key];
		return context.app.service('groups').create({ users }, context.params)
			.then(group => group._id)
			.catch((err) => {
				throw new BadRequest(`Can not create group ${key} for a new lesson.`, err);
			});
	};

	const [owner, users] = await Promise.all([createGroup('owner'), createGroup('users')]);

	context.data.owner = owner;
	context.data.users = users;
	return context;
};

const isMemberOf = (groups, user) => {
	const isMember = groups.some(group => includeId(group.users, user));
	if (!isMember) {
		throw new Forbidden('You are not a member of this lesson');
	}
};

const restrictedAfter = (context) => {
	const { user } = context.params;
	if (context.result.data) {
		const groups = [];
		context.result.data.forEach((lesson) => {
			groups.push(lesson.users);
			groups.push(lesson.owner);
		});
		isMemberOf(groups, user);
	} else {
		const { users, owner } = context.result;
		isMemberOf([users, owner], user);
	}

	return context;
};

const restrictedAfterOwner = (context) => {
	const { user } = context.params;
	if (!includeId(context.result.owner.users, user)) {
		throw new Forbidden('You have not the access to do this.');
	}
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
	create: [forceOwner, addNewGroups],
	update: [block],
	patch: [],
	remove: [],
};

exports.after = {
	all: [reduceToOwnSection],
	find: [restrictedAfter],
	get: [restrictedAfter],
	create: [],
	update: [],
	patch: [restrictedAfterOwner, removeEmptySteps],
	remove: [restrictedAfterOwner],
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
