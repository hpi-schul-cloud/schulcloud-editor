/* eslint-disable no-param-reassign */
const { BadRequest } = require('@feathersjs/errors');

const { block } = require('../../../global/hooks.js');
const { StepModel } = require('../../models');
const { sameId, forceArray } = require('../../../global/collection');
const {
	subsection,
	template,
	getLesson,
	patchLesson,
	removeSubSections,
} = require('../helpers/');


const fetchLessonData = async (context) => {
	const { parent, owner, lesson } = context.data;
	if (parent && owner && lesson) {
		return subsection(context, lesson, parent, owner);
	// eslint-disable-next-line no-else-return
	} else if (!parent && !owner && lesson) {
		return template(context, lesson);
	}
	return context;
	// throw new BadRequest('Wrong input values.');
};

const addToLesson = async (context) => {
	const { lesson, _id } = context.result;
	if (lesson === undefined) {
		throw new BadRequest('Missing parameter lesson as Id.');
	}
	const { steps } = await getLesson(context, lesson);
	const step = (new StepModel({ sections: [_id] }))._doc;
	steps.push(step);

	return patchLesson(context, lesson, { steps });
};

/**
 * Remove template sections from lesson.
 */
const removeFromLesson = async (context) => {
	const { lesson, _id, flag } = context.result;

	if (flag !== 'isTemplate') {
		return context;
	}

	let { steps } = await getLesson(context, lesson);
	steps = steps.map((step) => {
		if (step.sections === null) { // Clear get null, at the moment if no element is set.
			return undefined;
		}
		step.sections = forceArray(step.sections).filter(section => !sameId(section._id, _id));
		return step;
	});
	// remove undefined
	steps = steps.filter(step => step);

	return patchLesson(context, lesson, { steps });
};

const removeChilds = async (context) => {
	if (context.result.flag !== 'isTemplate') {
		return context;
	}
	context.result.subSectionIds = await removeSubSections(context);
	return context;
};

exports.before = {
	all: [],
	find: [],
	get: [],
	create: [fetchLessonData],
	update: [block],
	patch: [],
	remove: [],
};

exports.after = {
	all: [],
	find: [],
	get: [],
	create: [addToLesson],
	update: [],
	patch: [],
	remove: [removeFromLesson, removeChilds],
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
