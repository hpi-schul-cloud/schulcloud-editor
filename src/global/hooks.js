const { Forbidden } = require('@feathersjs/errors');

const { server: { coursePermissions } } = require('../routes');

const filterOutResults = keys => (context) => {
	if (context.result && context.type === 'after' && context.params.provider === 'rest') {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}
		if (context.method === 'find' && Array.isArray(context.result.data)) {
			context.result.data.forEach((ele) => {
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
			user, provider, route: { courseId }, authorization,
		},
		app,
	} = context;

	if (!(provider === 'rest')) {
		return context;
	}

	const { data: permissions } = await coursePermissions(app, courseId, user, authorization);

	if (permissions.includes(permission)) {
		return context;
	}

	throw new Forbidden('You have no access.');
};

module.exports = {
	filterOutResults,
	checkCoursePermission,
};
