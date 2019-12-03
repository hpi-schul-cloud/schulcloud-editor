const express = require('@feathersjs/express');
const Sentry = require('@sentry/node');

const {
	systemInfo, requestInfo, redInfo, logger,
} = require('../logger');

const executeWithSystemInfo = app => (middleware, info) => {
	if (info) systemInfo(`[middleware-error] ${info}`);
	app.use(middleware);
};

const shortErrorLine = (req, error) => {
	redInfo(`(${error.code}) Route: ${req.path} - ${error.message}`);
};

const catch405 = (error, req, res, next) => {
	if (error && error.code === 405) {
		shortErrorLine(req, error);
		res.json(error);
	} else {
		next(error); // next without error
	}
};

const logRelatedErrors = (error, req, res, next) => {
	if (error) {
		shortErrorLine(req, error);
		logger.error(error);
	}
	next(error);
};

const clearErrorsForSendOut = (error, req, res, next) => {
	if (error) {
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

	exec(catch405, 'If a services do not support an endpoint a error if throw but should not go to error pipeline.');

	if (app.get('NODE_ENV') !== 'test') {
		exec(logRelatedErrors,
			'logError: For pass error to winston logger and set additional short line for seperate errors.'
			+ 'Do not execute for 405 errors.');
		exec(logRequestErrors, 'logRequestErrors: Add request by error.');
		exec(Sentry.Handlers.errorHandler(), 'Sentry.Handlers.errorHandler(): Add sentry error handler.');
	}
	exec(clearErrorsForSendOut, 'clearErrorsForSendOut: Clear error before send out (stack and data).');
	exec(returnAsJson, 'returnAsJson: To convert html error pages to jsons.');
};
