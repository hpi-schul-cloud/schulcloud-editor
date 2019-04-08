/* eslint-disable no-param-reassign */
const { LessonModel, getLesson, StepModel } = require('../../global').models;
const { sameId, forceArray } = require('../../global').helpers;


const sectionRemove = (app) => {
	app.service('sections').on('removed', async (result, context) => {
		const { method, path } = context;
		const on = 'lesson';

		const { lesson, _id, flag } = result;

		if (flag !== 'isTemplate') {
			return;
		}

		let { steps } = await getLesson(lesson);

		// remove deleted sections
		steps.forEach((step) => {
			step.sections = forceArray(step.sections).filter(sectionId => sameId(sectionId, _id));
		});

		// remove empty steps
		steps = steps.filter(step => step.sections.length > 0);

		// patch upated sections into lesson
		LessonModel.findByIdAndUpdate(lesson, { steps }).lean().exec((err, doc) => {
			app.logger.event({
				on, method, path, result, err, doc,
			});
		});
	});
};

const createStep = sections => (new StepModel({ sections }))._doc;

const sectionCreate = (app) => {
	app.service('sections').on('created', async (result, context) => {
		const { method, path } = context;
		const on = 'lesson';

		const { lesson, _id, flag } = result;
		const { position } = context.data;

		if (flag !== 'isTemplate') {
			return;
		}

		const { steps } = await getLesson(lesson);
		const step = createStep([_id]);

		if (position < steps.length) {
			steps.splice(position, 0, step);
		} else {
			steps.push(step);
		}

		LessonModel.findByIdAndUpdate(lesson, { steps }).lean().exec((err, doc) => {
			app.logger.event({
				on, method, path, result, err, doc,
			});
		});
	});
};

module.exports = (app) => {
	sectionRemove(app);
	sectionCreate(app);
};
