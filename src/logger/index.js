const winston = require('winston');

const remove = require('./remove');
const request = require('./request');

const logger = {
	error: console.log,
	warn: console.log,
	info: console.log,
};

logger.remove = remove(logger);
logger.request = request(logger);

module.exports = logger;
