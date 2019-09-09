const handleForceTest = app => (req, res, next) => {
	const { force } = req.query;
	if (force === app.get('forceKey')) {
		delete req.query.force;
		req.feathers.force = true;
	} else {
		req.feathers.force = false;
	}
	next();
};

module.exports = (app) => {
	app.logger.info('Add force test.');
	app.use(handleForceTest(app));
};
