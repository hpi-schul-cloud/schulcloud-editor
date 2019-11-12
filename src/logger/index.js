const winston = require('winston');
const event = require('./event');

const systemLogLevel = process.env.SYSTEM_LOG_LEVEL || 'http';
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

const logger = winston.createLogger({
	level: logLevel,
	levels: winston.config.syslog.levels,
	format: winston.format.combine(
		winston.format.timestamp(), // adds current timestamp
	//	winston.format.ms(),	// adds time since last log
		winston.format.prettyPrint(), // Use 'winston.format.prettyPrint()' for string output
	),
	transports: [
		new winston.transports.Console({
			logLevel,
			handleExceptions: true,
		}),
	],
});

// add events log for methods
logger.event = event(logger, ['create', 'remove', 'update', 'patch']);

const systemLogger = winston.createLogger({
	level: systemLogLevel,
	levels: {			// todo syslog levels ?
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
	},
	format: winston.format.combine(
		winston.format.colorize({
			colors: {
				error: 'red',
				warn: 'blue',
				info: 'green',
				http: 'yellow',
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
const request = req => systemLogger.http({
	type: 'Request',
	userId: req.feathers.userId,
	url: req.url,
	data: req.body,
	method: req.method,
	timestamp: new Date(),
});

module.exports = {
	logger,
	requestInfo: request,
	systemInfo: systemLogger.info,
};
