const { Forbidden } = require('@feathersjs/errors');

const course = (server, courseUri) => (Authorization, courseId) => {
	const url = `${courseUri}/${courseId}`;
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
	const { server: { courseUri } } = app.get('routes');
	const server = app.get('routes:server');
	app.set('routes:server:course', course(server, courseUri));
	app.logger.info('Add route app.get("routes:server:course")');
};
