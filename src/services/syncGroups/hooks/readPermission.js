const readPermission = (context) => {
	const { route: { courseId }, query, user } = context.params;
	query.courseId = courseId;
	query.users = user;
	return context;
};

module.exports = readPermission;
