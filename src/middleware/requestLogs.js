const requestLogging = app => (req, res, next) => {
	req.feathers.headers = req.headers;
	app.logger.request(req);
	next();
};

module.exports = (app) => {
	app.logger.info('Set request logging.');
	return requestLogging(app);
};
