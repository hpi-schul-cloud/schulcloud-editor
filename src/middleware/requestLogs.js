const requestLogging = app => (req, res, next) => {
	app.logger.request(req);
	next();
};

module.exports = (app) => {
	app.use(requestLogging(app));
};
