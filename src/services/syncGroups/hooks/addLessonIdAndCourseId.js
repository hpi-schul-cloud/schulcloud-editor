/**
 * @method create
 * @param {*} context
 */
module.exports = (context) => {
	const { lessonId, courseId } = context.params.route;
	context.data.lessonId = lessonId;
	context.data.courseId = courseId;
	return context;
};
