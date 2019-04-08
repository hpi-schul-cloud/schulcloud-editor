const event = require('./event');
const request = require('./request');

const logger = {
	error: console.log,
	warn: console.log,
	info: console.log,
};

// add events log for methods
logger.event = event(logger, ['create', 'remove', 'update', 'patch']);
logger.request = request(logger);

module.exports = logger;
