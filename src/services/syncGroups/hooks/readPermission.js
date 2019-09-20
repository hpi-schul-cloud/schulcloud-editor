module.exports = (context) => {
	const { route: { lessonId }, query, user } = context.params;
	query.lessonId = lessonId;
	query.users = user;
	return context;
};
