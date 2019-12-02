const express = require('@feathersjs/express');
const Sentry = require('@sentry/node');

const { systemInfo, requestInfo, redInfo, logger } = require('../logger');

const executeWithSystemInfo = app => (middleware, info) => {
	if (info) systemInfo(`[middleware-error] ${info}`);
	app.use(middleware);
};

const logError = (error, req, res, next) => {
	if (error) {
		redInfo(`(${error.code}) Route: ${req.path} - ${error.message}`);
		logger.error(error);
	}
	next(error);
};

const clearErrorsForSendOut = (error, req, res, next) => {
	if (error) {
		// app.logger.info(error.stack);
		// clear for extern
		delete error.stack;
		delete error.data;
	}

	next(error);
};

const logRequestErrors = (error, req, res, next) => {
	if (error) {
		requestInfo(req);
		next(error);
	}
};

const returnAsJson = express.errorHandler({
	html: (error, req, res) => {
		res.json(error);
	},
});

module.exports = (app) => {
	systemInfo('\nAdd error handling middleware:');
	const exec = executeWithSystemInfo(app);

	if (app.get('NODE_ENV') !== 'test') {
		exec(logError, 'logError: For pass error to winston logger and set additional short line for seperate errors.');
		exec(logRequestErrors, 'logRequestErrors: Add request by error.');
		exec(Sentry.Handlers.errorHandler(), 'Sentry.Handlers.errorHandler(): Add sentry error handler.');
	}
	exec(clearErrorsForSendOut, 'clearErrorsForSendOut: Clear error before send out (stack and data).');
	exec(returnAsJson, 'returnAsJson: To convert html error pages to jsons.');
};
