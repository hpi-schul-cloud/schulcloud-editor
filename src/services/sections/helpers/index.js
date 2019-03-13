/* eslint-disable no-param-reassign */
const { Forbidden, BadRequest } = require('@feathersjs/errors');

const { getPermissions, patchPermissions } = require('./permission');
const { subsection, removeSubSections } = require('./subsections');


/* intern */
const rollback = (context) => {
	// todo: rollback section
	// remove || create
	console.log('todo: sections rolllback');
};

/**
 * Use the service for permission check.
 */
const getLesson = (context, id) => {
	if (id === undefined) {
		throw new BadRequest('Missing parameter lesson as Id.');
	}
	return context.app.service('lessons')
		.get(id, context.params)
		.catch((err) => {
			throw new Forbidden('Can not fetch data from lesson.', err);
		});
};

/**
 * Use model the lesson permission must test before. ? todo ?
 */
const patchLesson = (context, id, data) => context.app.service('lessons')
	.patch(id, data, context.params)
	.then(() => context)
	.catch((err) => {
		rollback(context);
		throw BadRequest('Can not patch lesson data.', err);
	});


/**
 * Validate lesson over getLesson and map the owner of the lesson to the owner of this template.
 */
const template = async (context, lesson) => {
	const { owner } = await getLesson(context, lesson);
	/** @override */
	context.data = {
		lesson,
		owner,
	};
	return context;
};

module.exports = {
	getPermissions,
	patchPermissions,
	subsection,
	template,
	patchLesson,
	removeSubSections,
	getLesson,
};
