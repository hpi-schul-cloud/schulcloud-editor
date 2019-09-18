const { BadRequest } = require('@feathersjs/errors');

const setCourseId = (context) => {
	const { courseId } = context.params.route || {};
	if (!courseId) {
		throw new BadRequest('No lessonId or courseId exist.');
	}
	if (!context.data) {
		throw new BadRequest('Data key is missing.');
	}

	context.data.courseId = courseId;
	return context;
};

module.exports = setCourseId;
