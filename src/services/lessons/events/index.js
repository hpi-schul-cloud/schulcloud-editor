/* eslint-disable no-param-reassign */
const { LessonModel, getLesson } = require('../../global').models;
const { sameId, forceArray } = require('../../global').helpers;


const sectionRemove = (app) => {
	app.service('sections').on('removed', async (result, context) => {
		const { method, path } = context;
		const on = 'lesson';

		const { lesson, _id, flag } = result;

		if (flag !== 'isTemplate') {
			return;
		}

		let { sections } = await getLesson(lesson);

		// remove deleted sections
		sections = forceArray(sections).filter(section => !sameId(section._id, _id));

		// patch upated sections into lesson
		LessonModel.findByIdAndUpdate(lesson, { sections }).lean().exec((err, doc) => {
			app.logger.event({
				on, method, path, result, err, doc,
			});
		});
	});
};

const sectionCreate = (app) => {
	app.service('sections').on('created', async (result, context) => {
		const { method, path } = context;
		const on = 'lesson';

		const { lesson, _id, flag } = result;
		const { position } = context.data;

		if (flag !== 'isTemplate') {
			return;
		}

		const { sections } = await getLesson(lesson);

		if (position < sections.length) {
			sections.splice(position, 0, _id);
		} else {
			sections.push(_id);
		}

		LessonModel.findByIdAndUpdate(lesson, { sections }).lean().exec((err, doc) => {
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
