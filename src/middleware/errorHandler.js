const express = require('@feathersjs/express');
const Sentry = require('@sentry/node');

const formatErrors = app => (error, req, res, next) => {
	if (error) {
		// app.logger.info(error.stack);
		// clear for extern
		error.stack = null;
		error.data = undefined;
	}

	next(error);
};

module.exports = (app) => {
	app.use(Sentry.Handlers.errorHandler());
	app.use(formatErrors(app));
	app.use(express.errorHandler({
		html: (error, req, res, next) => {
			res.json(error);
		},
	}));
};
