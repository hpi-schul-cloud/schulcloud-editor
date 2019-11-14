const express = require('@feathersjs/express');
const Sentry = require('@sentry/node');

const { systemInfo } = require('../logger');

const formatErrors = app => (error, req, res, next) => {
	if (error) {
		// app.logger.info(error.stack);
		// clear for extern
		delete error.stack;
		delete error.data;
	}

	next(error);
};

const returnAsJson = express.errorHandler({
	html: (error, req, res) => {
		res.json(error);
	},
});

module.exports = (app) => {
	systemInfo('Add error handling middleware.');
	app.use(Sentry.Handlers.errorHandler());
	app.use(formatErrors(app));
	app.use(returnAsJson);
};
