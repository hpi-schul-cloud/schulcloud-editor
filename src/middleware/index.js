/* eslint-disable no-console */
const { systemInfo } = require('../logger');
const addLoggerToApp = require('./addLoggerToApp');
const requestLogs = require('./requestLogs');
const ping = require('./ping');
const { apiJwtHandler } = require('./handleJWTAndAddToContext');
const addHeaderToContext = require('./addHeaderToContext');
const aggregateAppVars = require('./aggregateAppVars');
const socket = require('./socket');
const sentry = require('./sentry');


const executeWithSystemInfo = app => (middleware, info) => {
	app.configure(middleware);
	if (info) systemInfo(`[middleware] ${info}`);
};

module.exports = function setup(app) {
	systemInfo('***** Configure additional middleware operations *****\n');

	const exec = executeWithSystemInfo(app);

	exec(addLoggerToApp, 'logger to app'); // todo is not a middleware
	// app.configure(redis);
	exec(addHeaderToContext, 'Add header information to feather context.');
	exec(ping, 'Set ping route.'); // no middleware
	exec(apiJwtHandler, 'Add jwt decoder.');
	exec(requestLogs, 'Set request logging.');
	exec(aggregateAppVars, 'Aggregate app vars.'); // no middleware
	exec(socket, 'Add socket connections');
	exec(sentry, 'Add sentry for logging errors.');

	systemInfo('\n******************************************************\n');
};
