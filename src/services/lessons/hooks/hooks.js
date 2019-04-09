/* eslint-disable no-param-reassign */
const {
	isMemberOf,
	getSessionUser,
	isInGroup,
	createId,
	createGroupsInData,
	isForced,
} = require('../../global').helpers;
const { getLesson } = require('../../models');
const patchGroupIfArrayHook = require('./patchGroupIfArrayHook');
const restrictedAfter = require('./restrictedAfter');

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
 * If not owner and section is visible false remove it.
 * @after
 */
const removeHiddenSteps = (context) => {
	const user = getSessionUser(context);
	const { owner, sections } = context.result;
	const isMember = isInGroup(owner, user);
	if (isMember === false) {
		context.result.sections = sections.filter(section => section.visible);
	}
	return context;
};

/**
 * @before
 */
const restrictedOwner = async (context) => {
	if (isForced(context)) {
		return context;
	}
	const user = getSessionUser(context);
	const { owner } = await getLesson(context.id);
	isMemberOf([owner], user, true);
	return context;
};

module.exports = {
	addLessonId,
	addNewGroups,
	restrictedAfter,
	removeHiddenSteps,
	restrictedOwner,
	patchGroupIfArrayHook,
};
