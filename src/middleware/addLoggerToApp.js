const logger = require('../logger');

module.exports = (app) => {
	// eslint-disable-next-line no-param-reassign
	app.logger = logger;
	app.logger.info('Add logger to app.');
};
