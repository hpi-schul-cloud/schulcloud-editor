const logger = require('../logger');

module.exports = (app) => {
	// eslint-disable-next-line no-console
	console.log('Add logger to app.');
	app.logger = logger;
};
