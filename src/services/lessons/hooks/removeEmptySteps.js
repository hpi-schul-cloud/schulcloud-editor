/* eslint-disable no-param-reassign */
const { LessonModel } = require('../../models');

const removeEmptySteps = async (context) => {
	const id = context.result._id;
	let changes = false;
	// set emptys steps to undefined and detect changes.
	let steps = context.result.steps.map((step) => {
		if (step.sections === null || (step.sections || []).length <= 0) {
			changes = true;
			return undefined;
		}
		return step;
	});
	// If any changes is detected, then remove undefineds and update Lesson.
	// The return value do not wait if update is finish.
	if (changes === true) {
		steps = steps.filter(step => step);
		LessonModel.findByIdAndUpdate(id, { $set: { steps } }).exec((err) => {
			if (err) {
				throw new Error('Can not patch lesson steps', err);
			}
		});
		context.result.steps = steps;
	}

	return context;
};

module.exports = removeEmptySteps;
