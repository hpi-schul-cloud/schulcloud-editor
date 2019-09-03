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


// add events log for methods
logger.event = event(logger, ['create', 'remove', 'update', 'patch']);
logger.request = request(logger);


module.exports = logger;
