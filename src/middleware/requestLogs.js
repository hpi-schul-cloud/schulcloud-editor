const { requestInfo } = require('../logger');

const requestLogging = (req, res, next) => {
	requestInfo(req);
	next();
};

module.exports = (app) => {
	app.use(requestLogging);
};
