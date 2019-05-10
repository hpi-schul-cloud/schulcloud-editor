const event = require('./event');
const request = require('./request');
const winston = require('winston');
require('winston-syslog').Syslog
const syslogConfigs = require('../../config/syslog.json');

const syslogConfig = {};
if(process.env.NODE_ENV === "productive"){
	syslogConfig = syslogConfigs.productive;

} else {
	syslogConfig = syslogConfigs.development;
}



const logger = winston.createLogger({
	levels: winston.config.syslog.levels,
	transports: [
		new winston.transports.Syslog(syslogConfig),
		new winston.transports.Console({
			handleExceptions: true,
			json: false
		  })
	]
})


// add events log for methods
logger.event = event(logger, ['create', 'remove', 'update', 'patch']);
logger.request = request(logger);


module.exports = logger;
