/* eslint-disable no-param-reassign */
const { LessonModel, getLesson } = require('../../global').models;
const { sameId } = require('../../global').helpers;

const sectionRemove = (app) => {
	app.service('sections').on('removed', async (result, context) => {
		const { method, path } = context;
		const on = 'lesson';

		const { lesson, _id } = result;

		let { steps } = await getLesson(lesson);

		// remove deleted sections
		steps.forEach((step) => {
			step.sections = step.sections.filter(sectionId => sameId(sectionId, _id));
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

module.exports = (app) => {
	sectionRemove(app);
};
