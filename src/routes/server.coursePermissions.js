const { Forbidden } = require('@feathersjs/errors');

const coursePermissions = (server, coursePermissionsUri) => (courseId, userId, Authorization) => {
	const url = `${coursePermissionsUri}/${userId}`.replace(':courseId', courseId);
	return server.get(url, {
		headers: {
			Authorization,
		},
	}).catch((err) => {
		if (err.response) {
			throw new Forbidden(err.response.statusText || 'You have no access.', err.response.data || err.response);
		}
		throw new Forbidden('You have no access.', err);
	});
};

module.exports = (app) => {
	const { server: { coursePermissionsUri } } = app.get('routes');
	const server = app.get('routes:server');
	app.set('routes:server:coursePermissions', coursePermissions(server, coursePermissionsUri));
	app.logger.info('Add route app.get("routes:server:coursePermissions")');
};
