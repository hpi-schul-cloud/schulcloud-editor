const { BadRequest } = require('@feathersjs/errors');
/**
 * @method {patch, update, create}
 * @param {*} context
 */
const addCourseId = (context) => {
	const { courseId } = context.params;
	if (!courseId) {
		throw new BadRequest('No courseId exist.');
	}
	context.data.courseId = courseId;
	return context;
};

module.exports = addCourseId;
