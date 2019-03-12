/* eslint-disable no-param-reassign */
const { Forbidden, BadRequest } = require('@feathersjs/errors');

const { GroupModel, SectionModel } = require('../../models');

/* intern */
const isGroupExist = id => GroupModel.findById(id, '_id')
	.lean().exec((err, doc) => {
		if (err) { throw new BadRequest('Can not fetch group.', err); }
		return doc._id === id;
	});

/* intern */
const isSectionExist = id => SectionModel.findById(id, '_id')
	.lean().exec((err, doc) => {
		if (err) { throw new BadRequest('Can not fetch section.', err); }
		return doc._id === id;
	});

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

const removeSubSections = context => SectionModel.deleteMany({ parent: context.result._id })
	.lean().exec((err, doc) => {
		if (err) {
			rollback(context);
			throw new BadRequest('Can delte subSections', err);
		}
		console.log('todo: reduce to ids and return');
		return doc;
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

/**
 * Validate the group and section id. But not the lesson.
 * Add the flag 'isFromStudent'.
 */
const subsection = async (context, lesson, parent, owner) => {
	const { groupExist, sectionExist } = await Promise.all([isGroupExist, isSectionExist]);
	if (groupExist === false || sectionExist === false) {
		throw new BadRequest('A group or section with this id, do not exist.', { groupExist, sectionExist });
	}
	context.data = {
		lesson,
		owner,
		parent,
		flag: 'isFromStudent',
	};
	return context;
};

module.exports = {
	subsection,
	template,
	patchLesson,
	removeSubSections,
	getLesson,
};
