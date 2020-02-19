/* eslint-disable no-console */
const { systemInfo } = require('../logger');
const addLoggerToApp = require('./addLoggerToApp');
const requestLogs = require('./requestLogs');
const ping = require('./ping');
const { apiJwtHandler } = require('./handleJWTAndAddToContext');
const addHeaderToContext = require('./addHeaderToContext');
const aggregateAppVars = require('./aggregateAppVars');
const socket = require('./socket');
const feathersSync = require('./feathersSync');
const sentry = require('./sentry');


const executeWithSystemInfo = app => (middleware, info) => {
	if (info) systemInfo(`[middleware] ${info}`);
	app.configure(middleware);
};

module.exports = function setup(app) {
	systemInfo('***** Configure additional middleware operations *****\n');

	const exec = executeWithSystemInfo(app);

	exec(addLoggerToApp, 'addLoggerToApp: Add logger to app'); // TODO: is not a middleware
	// app.configure(redis);
	exec(addHeaderToContext, 'Add header information to feather context.'); // TODO: @deprecated
	exec(ping, 'Set ping route.'); // no middleware
	exec(apiJwtHandler, 'Add jwt decoder.');
	if (!['production', 'test'].includes(app.get('NODE_ENV'))) {
		exec(requestLogs, 'Set request logging.');
	}
	exec(aggregateAppVars, 'aggregateAppVars: Add aggregate app vars and display it.'); // TODO: no middleware
	exec(socket, 'socket: Add socket connections');
	if (app.get('redis') && app.get('redis') !== 'REDIS_URI') {
		exec(feathersSync, 'feathers-sync: Add feathers-sync');
	}
	if (app.get('NODE_ENV') !== 'test') {
		exec(sentry, 'sentry: Add sentry for logging errors.');
	}

	systemInfo('\n******************************************************\n');
};
