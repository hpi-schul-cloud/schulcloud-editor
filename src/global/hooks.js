const { Forbidden, BadRequest } = require('@feathersjs/errors');

const filterOutResults = keys => (context) => {
	if (context.result && context.type === 'after') {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}
		// todo pagination test and switch to context.result.data
		if (context.method === 'find' && Array.isArray(context.result)) {
			context.result.forEach((ele) => {
				keys.forEach((key) => {
					delete ele[key];
				});
			});
		} else {
			keys.forEach((key) => {
				delete context.result[key];
			});
		}
	}
	return context;
};


/**
 * Request Course service to get permissions
 *
 * @param {string} permission
 */
const checkCoursePermission = permission => async (context) => {
	const {
		params: {
			user, route: { courseId }, authorization,
		},
		app,
	} = context;

	const permissions = await app.serviceRoute('server/courses/userPermissions')
		.get(user.id, authorization, { courseId });

	if (permissions.isAxiosError || !Array.isArray(permissions)) {
		throw new BadRequest('Can not request server.', permissions);
	}

	if (!permissions.includes(permission)) {
		throw new Forbidden('Missing privileges');
	}

	return context;
};

module.exports = {
	filterOutResults,
	checkCoursePermission,
};
