const event = require('./event');
const request = require('./request');
const winston = require('winston');


const logger = winston.createLogger({
	levels: winston.config.syslog.levels,
	format: winston.format.combine(
		winston.format.timestamp(), // adds current timestamp
		winston.format.ms(),	// adds time since last log
		winston.format.simple(), // output as string. Use 'winston.format.prettyPrint()' for well formated json
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
