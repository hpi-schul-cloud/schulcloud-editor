const requestLogging = app => (req, res, next) => {
	app.logger.request(req);
	next();
};

module.exports = (app) => {
	app.logger.info('Set request logging.');
	app.use(requestLogging(app));
};
