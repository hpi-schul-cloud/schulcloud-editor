const headerToContextHandler = (req, res, next) => {
	req.feathers.headers = req.headers;
	next();
};

module.exports = (app) => {
	app.logger.info('Add header information to feather context.');
	app.use(headerToContextHandler);
};
