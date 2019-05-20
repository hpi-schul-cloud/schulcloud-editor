const event = require('./event');
const request = require('./request');
const winston = require('winston');
const syslogConfigs = require('../../config/syslog.json');


const logger = winston.createLogger({
	levels: winston.config.syslog.levels,
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.ms(),
		winston.format.prettyPrint(),
		winston.format.simple(),
	),
	transports: [
		new winston.transports.Console({
			handleExceptions: true
		  })
	]
})


// add events log for methods
logger.event = event(logger, ['create', 'remove', 'update', 'patch']);
logger.request = request(logger);


module.exports = logger;
