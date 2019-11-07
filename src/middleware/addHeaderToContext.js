const headerToContextHandler = (req, res, next) => {
	req.feathers.headers = req.headers;
	next();
};

module.exports = (app) => {
	app.use(headerToContextHandler);
};
