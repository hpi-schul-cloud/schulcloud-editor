const { Forbidden } = require('@feathersjs/errors');
const server = require('./server');

const coursePermissions = app => (
	courseId,
	{ authorization = '', userId, query = {} }, // todo add query interpreter
) => {
	const { server: { coursePermissionsUri } } = app.get('routes');
	let url = coursePermissionsUri.replace(':courseId', courseId);
	if (userId) {
		url += `/${userId}`;
	}
	return server(app).get(url, {
		headers: {
			Authorization: authorization,
		},
	}).catch((err) => {
		if (err.response) {
			throw new Forbidden(err.response.statusText || 'You have no access.', err.response.data || err.response);
		}
		throw new Forbidden('You have no access.', err);
	});
};

const setupCoursePermissions = (app) => {
	app.set('routes:server:coursePermissions', coursePermissions(app));
	app.logger.info('Add route app.get("routes:server:coursePermissions")');
};

module.exports = {
	setupCoursePermissions,
	coursePermissions,
};
