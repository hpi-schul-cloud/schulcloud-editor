const { isMemberOf, getSessionUser } = require('../../global').helpers;
/**
 * Can only save use in get and find operations.
 */
const restrictedAfter = (context) => {
	if (context.params.force) {
		return context;
	}
	const user = getSessionUser(context);
	if (context.result.data) {
		const groups = [];
		context.result.data.forEach((lesson) => {
			groups.push(lesson.users);
			groups.push(lesson.owner);
		});
		isMemberOf(groups, user, true);
	} else {
		const { users, owner } = context.result;
		isMemberOf([users, owner], user, true);
	}

	return context;
};

module.exports = restrictedAfter;
