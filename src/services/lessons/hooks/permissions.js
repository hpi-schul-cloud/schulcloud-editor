const { Forbidden } = require('@feathersjs/errors');

const logger = require('../../../logger');
const { courseService, routes } = require('../../../routes/course');
/**
 * Request Course service to get permissions, is only needed for create and lessons overview
 * all other permissions are internal
 *
 * @param {string} permission
 */
const checkCoursePermission = permission => async (context) => {
	const { params: { user, route, headers } } = context;

	try {
		const permissions = await courseService
			.get(
				routes.permissions({ courseId: route.courseId }),
				{
					params: {
						userId: user.id,
					},
					headers: {
						Authorization: headers.authorization,
					},
				},
			);
		if (!permissions.data[user.id].includes(permission)) {
			throw new Forbidden('Missing privileges');
		}
	} catch (err) {
		logger.error(`Request course permissions failed: ${err}`);
		throw err;
	}

	return context;
};


module.exports = {
	checkCoursePermission,
};
