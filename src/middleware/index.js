/* eslint-disable no-console */
const addLoggerToApp = require('./addLoggerToApp');
const requestLogs = require('./requestLogs');
const ping = require('./ping');
const { apiJwtHandler } = require('./handleJWTAndAddToContext');
const addHeaderToContext = require('./addHeaderToContext');
const aggregateAppVars = require('./aggregateAppVars');
const socket = require('./socket');

module.exports = function setup(app) {
	console.log('***** Configure additional middleware operations *****\n');

	// important that logger is add as first
	app.configure(addLoggerToApp);
	// app.configure(redis);
	app.configure(addHeaderToContext);
	app.configure(ping);
	app.configure(apiJwtHandler);
	app.configure(requestLogs);
	app.configure(aggregateAppVars);
	app.configure(socket);

	console.log('\n******************************************************\n');
};
