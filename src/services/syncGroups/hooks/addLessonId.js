const { BadRequest } = require('@feathersjs/errors');
/**
 * @method {patch, update, create}
 * @param {*} context
 */
const addLessonId = (context) => {
	const { lessonId } = context.params.route || {};
	if (!lessonId) {
		throw new BadRequest('No lessonId exist.');
	}
	if (!context.data) {
		throw new BadRequest('Data key is missing.');
	}
	context.data.lessonId = lessonId;
	return context;
};

module.exports = addLessonId;
