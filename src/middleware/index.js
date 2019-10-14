/* eslint-disable no-console */
const loggerAddHandler = require('./addLoggerToApp');
const getForceKey = require('./getForceKey');
const requestLogs = require('./requestLogs');
const ping = require('./ping');
const { apiJwtHandler } = require('./handleJWTAndAddToContext');
const addHeaderToContext = require('./addHeaderToContext');
const addForceTest = require('./addForceTest');
// const redis = require('../database/redis');
const socket = require('./socket');

module.exports = function setup() {
	console.log('___Configure additional middleware operations___\n');

	const app = this;
	// important that logger is add as first
	app.configure(loggerAddHandler);
	// app.configure(redis);
	app.configure(addHeaderToContext);
	app.configure(getForceKey);
	app.configure(ping);
	app.configure(apiJwtHandler);
	app.configure(addForceTest);
	app.configure(requestLogs);
	app.configure(socket);

	console.log('_________________\n');
};
