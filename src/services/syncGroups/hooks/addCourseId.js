/**
 * @method {patch, update, create}
 * @param {*} context
 */
const addCourseId = (context) => {
	const { courseId } = context.params.route;
	context.data.courseId = courseId;
	return context;
};

module.exports = addCourseId;
