
const setCourseId = (context) => {
	const { data, params } = context;
	data.courseId = params.route.courseId;
	return context;
};

module.exports = {
	setCourseId,
};
