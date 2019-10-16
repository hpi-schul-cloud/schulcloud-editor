/* eslint-disable no-console */
const loggerAddHandler = require('./addLoggerToApp');
const getForceKey = require('./getForceKey');
const requestLogs = require('./requestLogs');
const ping = require('./ping');
const handleJWTAndAddToContext = require('./handleJWTAndAddToContext');
const addHeaderToContext = require('./addHeaderToContext');
const addForceTest = require('./addForceTest');
const aggregateAppVars = require('./aggregateAppVars');

module.exports = function setup() {
	console.log('___Configure additional middleware operations___\n');

	const app = this;
	// important that logger is add as first
	app.configure(loggerAddHandler);
	app.configure(addHeaderToContext);
	app.configure(getForceKey);
	app.configure(ping);
	app.configure(handleJWTAndAddToContext);
	app.configure(addForceTest);
	app.configure(requestLogs);
	app.configure(aggregateAppVars);

	console.log('_________________\n');
};
