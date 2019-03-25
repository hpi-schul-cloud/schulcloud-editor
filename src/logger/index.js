const event = require('./event');
const request = require('./request');

const logger = {
	error: console.log,
	warn: console.log,
	info: console.log,
};

logger.event = event(logger);
logger.request = request(logger);

module.exports = logger;
