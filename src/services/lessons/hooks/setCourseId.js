/**
 * @method create
 * @param {*} context
 */
const setCourseId = (context) => {
	context.data.courseId = context.params.route.courseId;
	return context;
};

module.exports = setCourseId;
