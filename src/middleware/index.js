/* eslint-disable no-console */
const logger = require('../logger');
const loggerAddHandler = require('./addLoggerToApp');
const getForceKey = require('./getForceKey');
const requestLogs = require('./requestLogs');
const ping = require('./ping');
const handleJWTAndAddToContext = require('./handleJWTAndAddToContext');
const addHeaderToContext = require('./addHeaderToContext');

module.exports = function setup() {
	logger.info('Configure additional middleware operations.');

	const app = this;
	// important that logger is add as first
	app.configure(loggerAddHandler);
	app.configure(addHeaderToContext);
	app.configure(getForceKey);
	app.configure(ping);
	app.configure(requestLogs);
	app.configure(handleJWTAndAddToContext);
};
