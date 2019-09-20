const { Forbidden } = require('@feathersjs/errors');
const server = require('./server');

const me = app => (userId, Authorization, query) => {
	const { server: { meUri } } = app.get('routes');
	const url = `${meUri}/${userId}`;
	return server(app).get(url, {
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

const setupMe = (app) => {
	app.set('routes:server:me', me(app));
	app.logger.info('Add route app.get("routes:server:me")');
};

module.exports = {
	setupMe,
	me,
};
