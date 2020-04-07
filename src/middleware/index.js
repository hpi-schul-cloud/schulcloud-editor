/* eslint-disable no-console */
const { systemInfo, logger } = require('../logger');
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
	const redisUriDefined = app.get('redis') && app.get('redis') !== 'REDIS_URI';
	const redisKeyDefined = app.get('redis_key') && app.get('redis_key') !== 'REDIS_KEY';
	if (redisUriDefined && redisKeyDefined) {
		exec(feathersSync, 'feathers-sync: Add feathers-sync');
	} else {
		logger.warning(`REDIS_URI (${app.get('redis')}) or REDIS_KEY (${app.get('redis_key')}) env is not defined`);
	}
	if (app.get('NODE_ENV') !== 'test') {
		exec(sentry, 'sentry: Add sentry for logging errors.');
	}

	systemInfo('\n******************************************************\n');
};
