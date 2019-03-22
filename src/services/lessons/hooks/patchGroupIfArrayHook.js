/* eslint-disable no-param-reassign */
const { isArray, isArrayWithElement } = require('../../../global/collection');
const { getLesson, updateGroup } = require('../../models');

const patchGroupIfArray = (context, lesson, newOwner, key) => {
	const users = context.data[key];
	if (!isArray(users)) {
		return Promise.resolve(undefined);
	}
	const group = lesson[key];
	const groupId = group._id;
	group.users = users;
	if (newOwner) {
		group.owner = newOwner;
	}
	// delete becouse patch for this key is already solved and should not pass to lesson patch
	delete context.data[key];
	return updateGroup(groupId, group);
};

const patchGroupIfArrayHook = async (context) => {
	const { owner, users } = context.data;
	// test if it need changes
	if (!(isArray(owner) || isArray(users))) {
		return context;
	}

	const lesson = await getLesson(context.id);
	const oldOwner = lesson.owner.owner;
	let newOwner;
	if (isArrayWithElement(owner) && !owner.includes(oldOwner)) {
		// replace owner in groups if old is removed
		[newOwner] = owner;
	}
	await Promise.all([
		patchGroupIfArray(context, lesson, newOwner, 'owner'),
		patchGroupIfArray(context, lesson, newOwner, 'users'),
	]);
	return context;
};

module.exports = patchGroupIfArrayHook;
