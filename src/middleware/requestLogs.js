const requestLogging = app => (req, res, next) => {
	app.logger.request(req);
	next();
};

module.exports = (app) => {
	// eslint-disable-next-line no-console
	console.log('Set request logging.');
	app.use(requestLogging(app));
};
