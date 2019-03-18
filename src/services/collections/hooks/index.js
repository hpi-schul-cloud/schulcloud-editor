/* eslint-disable no-confusing-arrow */
/* eslint-disable no-param-reassign */
const { Forbidden } = require('@feathersjs/errors');
const { block } = require('../../../global/hooks');
const { isInGroup, getSessionUser, createGroupsInData } = require('../../../global/collection');
const { getCollection } = require('../../models');

const restrictedOwner = async (context) => {
	const user = getSessionUser(context);
	const { owner } = await getCollection(context.id);
	if (!isInGroup(owner, user)) {
		throw new Forbidden('You have no permission to access this.');
	}
	return context;
};

/**
 * Use session user for new creating owner group, if no owner is set.
 */
const addNewGroupsIfNeeded = (context) => {
	if (!context.data.owner) {
		return createGroupsInData(context, getSessionUser(context), 'owner');
	}
	return context;
};

exports.before = {
	all: [],
	find: [restrictedOwner],
	get: [restrictedOwner],
	create: [addNewGroupsIfNeeded],
	update: [block],
	patch: [restrictedOwner],
	remove: [restrictedOwner],
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
