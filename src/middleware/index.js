/* eslint-disable no-console */
const logger = require('../logger');
const getForceKey = require('./getForceKey');
const requestLogs = require('./requestLogs');
const ping = require('./ping');

module.exports = function setup() {
	logger.info('Configure additional middleware operations.');

	const app = this;
	app.logger = logger;

	getForceKey(app);
	ping(app);
	app.use(requestLogs(app));
};
