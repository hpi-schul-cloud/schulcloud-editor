const { logger } = require('../logger');

module.exports = (app) => {
	app.logger = logger;
};
