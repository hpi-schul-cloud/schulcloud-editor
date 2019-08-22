const { Forbidden } = require('@feathersjs/errors');

const logger = require('../../../logger');
const { courseService, routes } = require('../../../../routes/course');
const config = require('../../../../config');
/**
 * Request Course service to get permissions, is only needed for create and lessons overview
 * all other permissions are internal
 *
 * @param {string} permission
 */
const checkCoursePermission = permission => async (context) => {
	const { params: { user, route, authorization } } = context;

	try {
		const permissions = await courseService
			.get(
				routes.permissions({ courseId: route.courseId }),
				{
					params: {
						userId: user.userId,
					},
					headers: {
						Authorization: authorization,
					},
				},
			);
		if (!permissions.data[user.userId].includes(permission)) {
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
