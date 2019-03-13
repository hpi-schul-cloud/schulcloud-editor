/* eslint-disable no-param-reassign */
const { BadRequest } = require('@feathersjs/errors');

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

const removeSubSections = context => SectionModel.deleteMany({ parent: context.result._id })
	.lean().exec((err, doc) => {
		if (err) {
		//	rollback(context);
			throw new BadRequest('Can delte subSections', err);
		}
		console.log('todo: reduce to ids and return');
		return doc;
	});

module.exports = {
	subsection,
	removeSubSections,
};
