const { BadRequest } = require('@feathersjs/errors');
/**
 * @method {patch, update, create}
 * @param {*} context
 */
module.exports = (context) => {
	const { lessonId, courseId } = context.params.route || {};
	if (!lessonId || !courseId) {
		throw new BadRequest('No lessonId or courseId exist.', { lessonId, courseId });
	}
	if (!context.data) {
		throw new BadRequest('Data key is missing.');
	}
	context.data.lessonId = lessonId;
	context.data.courseId = courseId;
	return context;
};
