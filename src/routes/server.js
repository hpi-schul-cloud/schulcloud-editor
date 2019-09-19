const axios = require('axios');
const coursePermissions = require('./server.coursePermissions');
const me = require('./server.me');

const server = (app) => {
	const { server: { baseURL }, timeout } = app.get('routes');
	const axiosServer = axios.create({
		baseURL,
		timeout,
	});
	app.set('routes:server', axiosServer);
	app.logger.info('Add route app.get("routes:server")');
};

module.exports = (app) => {
	app.configure(server);
	app.configure(coursePermissions);
	app.configure(me);
};
