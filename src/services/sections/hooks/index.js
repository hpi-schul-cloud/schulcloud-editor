/* eslint-disable no-param-reassign */
const { Forbidden } = require('@feathersjs/errors');

const { block } = require('../../global').hooks;
const { getSection } = require('../../global').models;
const { isInGroup, getSessionUser } = require('../../global').helpers;
const { subsection, template, removeSubSections } = require('../helpers/');

const fetchLessonData = async (context) => {
	const { parent, owner, lesson } = context.data;
	if (parent && owner && lesson) {
		return subsection(context, lesson, parent, owner);
	}
	if (!parent && !owner && lesson) {
		return template(context, lesson);
	}
	return context;
};

const removeChilds = async (context) => {
	if (context.result.flag !== 'isTemplate') {
		return context;
	}
	context.result.subSectionIds = await removeSubSections(context);
	return context;
};

const restrictedOwner = async (context) => {
	const user = getSessionUser(context);
	const { owner } = await getSection(context.id);
	if (!isInGroup(owner, user)) {
		throw new Forbidden('You have no permission to access this.');
	}
	return context;
};

const restricted = (permission = 'read') => async (context) => {
	const hasPermission = p => (permission === 'read' && p.read === true) || p.write === true || p.create === true;

	const user = getSessionUser(context);
	const { owner, permissions } = await getSection(context.id);
	if (isInGroup(owner, user)) {
		return context;
	}
	for (let i = 0; i < permissions.length; i += 1) {
		const p = permissions[i];
		if (isInGroup(p.group, user) && hasPermission(p)) {
			return context;
		}
	}
	throw new Forbidden('You have no permission to access this.');
};

const restrictedStateMutation = (context) => {
	console.log('todo state mutations');
	return context;
};

exports.before = {
	all: [],
	find: [restricted('read')],
	get: [restricted('read')],
	create: [fetchLessonData],
	update: [block],
	patch: [restricted('write'), restrictedStateMutation],
	remove: [restrictedOwner],
};

exports.after = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [removeChilds],
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
