const winston = require('winston');
const util = require('util');

const event = require('./event');

const { format, transports } = winston;

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
	format: format.combine(
		format.colorize({
			colors: {
				error: 'red',
				systemLogs: 'green',
				request: 'yellow',
				sendRequests: 'blue',
			},
			message: true,
		}),
		format.printf(log => log.message),
	),
	transports: [
		new transports.Console({
			name: 'systemLogger',
			handleExceptions: true,
		}),
	],
	exitOnError: false,
});
const request = (req, payload = {}) => systemLogger.request(util.inspect({
	type: payload.type || 'Request',
	userId: payload.userId || (req.feathers || {}).userId,
	url: req.url,
	data: req.body,
	method: req.method,
	timestamp: new Date(),
}, {
	depth: 10, compact: false, breakLength: 120,
}));

const addType = format.printf((log) => {
	if (log.stack || log.level === 'error') {
		log.type = 'error';
	} else {
		log.type = 'log';
	}
	return log;
});

let formater;
if (process.env.NODE_ENV === 'test') {
	formater = format.combine(
		format.prettyPrint({ depth: 1, colorize: true }),
	);
} else {
	formater = format.combine(
		format.timestamp(),
		addType,
		format.prettyPrint({ depth: 3, colorize: true }),
	);
}

const logger = winston.createLogger({
	level: logLevel,
	levels: winston.config.syslog.levels,
	format: formater,
	transports: [
		new transports.Console({
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
