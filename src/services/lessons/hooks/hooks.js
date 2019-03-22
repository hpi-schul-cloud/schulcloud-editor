/* eslint-disable no-param-reassign */
const {
	isMemberOf,
	getSessionUser,
	isInGroup,
	createId,
	createGroupsInData,
} = require('../../../global/collection');
const { getLesson } = require('../../models');
const patchGroupIfArrayHook = require('./patchGroupIfArrayHook');
const removeEmptySteps = require('./removeEmptySteps');
const restrictedAfter = require('./restrictedAfter');

/**
 * Is enable later for more complex usecases if it needed.
 * In first step the database model result is simplyfy with this hook.
 * @after
 */
const reduceToOwnSection = (context) => {
	context.result.steps = context.result.steps.map((step) => {
		// eslint-disable-next-line prefer-destructuring
		step.sections = step.sections[0] || null;	// array to own element
		return step;
	});
	return context;
};

/**
 * @method patch, create
 * @before
 */
const addLessonId = (context) => {
	if (!context.data._id) {
		context.data._id = createId();
	}
	return context;
};

/**
 * @method patch, create
 * @before
 */
const addNewGroups = context => createGroupsInData(context, context.data._id, ['owner', 'users']);

/**
 * If not visible remove steps for not owners.
 * @after
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

/**
 * @before
 */
const restrictedOwner = async (context) => {
	const user = getSessionUser(context);
	const { owner } = await getLesson(context.id);
	isMemberOf([owner], user, true);
	return context;
};

module.exports = {
	reduceToOwnSection,
	addLessonId,
	addNewGroups,
	restrictedAfter,
	removeSteps,
	restrictedOwner,
	removeEmptySteps,
	patchGroupIfArrayHook,
};
