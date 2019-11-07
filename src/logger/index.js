const winston = require('winston');
const event = require('./event');
const request = require('./request');

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
	exitOnError: false,
	levels: winston.config.syslog.levels,
	format: winston.format.combine(
		winston.format.timestamp(), // adds current timestamp
		winston.format.ms(),	// adds time since last log
		winston.format.prettyPrint(), // Use 'winston.format.prettyPrint()' for string output
	),
	transports: [
		new winston.transports.Console({
			logLevel,
			handleExceptions: true,
		}),
	],
});


const colors = {
//	emerg: 'green',
//	alert: 'green',
//	crit: 'green',
//	error: 'green',
//	warning: 'green',
	notice: 'green',
	info: 'green',
//	debug: 'green',
};

const systemLogger = winston.createLogger({
	level: 'info',
	exitOnError: false,
	format: winston.format.combine(
		winston.format.colorize({ colors, message: true }),
		winston.format.printf(log => log.message),
	),
	transports: [
		new winston.transports.Console({
			// colorize: true,
		}),
	],
});

// add events log for methods
logger.event = event(logger, ['create', 'remove', 'update', 'patch']);
logger.request = request(logger);


module.exports = {
	logger,
	systemInfo: systemLogger.info,
};
