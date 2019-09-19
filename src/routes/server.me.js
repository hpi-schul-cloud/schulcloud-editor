const { Forbidden } = require('@feathersjs/errors');

const me = (server, meUri) => (userId, Authorization, query) => {
	const url = `${meUri}/${userId}`;
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
	const { server: { meUri } } = app.get('routes');
	const server = app.get('routes:server');
	app.set('routes:server:me', me(server, meUri));
	app.logger.info('Add route app.get("routes:server:me")');
};
