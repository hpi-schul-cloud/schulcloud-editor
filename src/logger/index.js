const winston = require('winston');
const event = require('./event');

const systemLogLevel = process.env.SYSTEM_LOG_LEVEL || 'sendRequests';
let logLevel = process.env.LOG_LEVEL;

if (!logLevel) {
	switch (process.env.NODE_ENV) {
		case 'default':
		case 'development':
			logLevel = 'debug';
			break;
		case 'test':
			logLevel = 'emerg';
			break;
		case 'production':
		default:
			logLevel = 'info';
	}
}

const systemLogger = winston.createLogger({
	level: systemLogLevel,
	levels: {			// todo syslog levels ?
		error: 0,
		systemLogs: 1,
		request: 2,
		sendRequests: 3,
	},
	format: winston.format.combine(
		winston.format.colorize({
			colors: {
				error: 'red',
				systemLogs: 'green',
				request: 'yellow',
				sendRequests: 'blue',
			},
			message: true,
		}),
		winston.format.printf(log => log.message),
	),
	transports: [
		new winston.transports.Console({
			name: 'systemLogger',
		}),
	],
});
const request = req => systemLogger.request({
	type: 'Request',
	userId: req.feathers.userId,
	url: req.url,
	data: req.body,
	method: req.method,
	timestamp: new Date(),
});

const logger = winston.createLogger({
	level: logLevel,
	levels: winston.config.syslog.levels,
	format: winston.format.combine(
		winston.format.timestamp(), // adds current timestamp
		//	winston.format.ms(),	// adds time since last log
		winston.format.prettyPrint(), // Use 'winston.format.prettyPrint()' for string output
		// todo format for MethodNotAllowed: Method `update` is not supported by this endpoint.  -> MethodNotAllowed:
	),
	transports: [
		new winston.transports.Console({
			logLevel,
			handleExceptions: true,
		}),
	],
	exitOnError: false,
});

// add events log for methods
logger.event = event(logger, ['create', 'remove', 'update', 'patch']);

module.exports = {
	logger,
	redInfo: systemLogger.error,
	sendRequests: systemLogger.sendRequests,
	requestInfo: request,
	systemInfo: systemLogger.systemLogs,
};
