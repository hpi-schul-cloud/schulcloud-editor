/* eslint-disable no-param-reassign */
const { BadRequest } = require('@feathersjs/errors');
const {
	restricted, populate, forceOwner, block, log,
} = require('../../../global/hooks');
// const { forceArray } = require('../../../global/collection');


/**
 * Is enable later for more complex usecases if it needed.
 * In first step the database model result is simplyfy with this hook.
 */
const reduceToOwnSection = (context) => {
	context.result.steps = context.result.steps.map((step) => {
		// eslint-disable-next-line prefer-destructuring
		step.sections = step.sections[0];	// array to own element
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

exports.before = {
	all: [populate(['steps.sections', 'users', 'owners'])],
	find: [restricted(['owner', 'users'])],
	get: [restricted(['owner', 'users'])],
	create: [forceOwner, addNewGroups],
	update: [block],
	patch: [restricted('owner')],
	remove: [restricted('owner')],
};

exports.after = {
	all: [reduceToOwnSection],
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
