const headerToContextHandler = (req, res, next) => {
	req.feathers.headers = req.headers;
	next();
};

module.exports = (app) => {
	// eslint-disable-next-line no-console
	console.log('Add header information to feather context.');
	app.use(headerToContextHandler);
};
