const { BadRequest } = require('@feathersjs/errors');

module.exports = (context) => {
	const { lessonId, courseId } = context.params.route || {};
	if (!lessonId || !courseId) {
		throw new BadRequest('No lessonId or courseId exist.', { lessonId, courseId });
	}
	// @override
	context.params.query.courseId = courseId;
	context.params.query.lessonId = lessonId;
	return context;
};
