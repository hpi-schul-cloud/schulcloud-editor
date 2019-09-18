const server = require('./server');

module.exports = (app) => {
	app.configure(server);
}
