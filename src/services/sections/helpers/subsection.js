/* eslint-disable no-param-reassign */
const { BadRequest } = require('@feathersjs/errors');

const { getGroup, getSection, SectionModel } = require('../../models');

/**
 * Validate the group and section id. But not the lesson.
 * Add the flag 'isFromStudent'.
 */
const subsection = async (context, lesson, parent, owner) => {
	const isGroupExist = getGroup(owner).then(() => true);
	const isSectionExist = getSection(getSection).then(() => true);
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
	.lean().exec();

module.exports = {
	subsection,
	removeSubSections,
};
