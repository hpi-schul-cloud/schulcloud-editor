const Sentry = require('@sentry/node');

const { systemInfo } = require('../logger');

/**
 * helpers
 */
const replaceIds = (string) => {
	if (string) {
		return string.replace(/[a-f\d]{24}/ig, '[id]');
	}
	return string;
};

/**
 * Middlewares
 * @param {SentryEvent} event
 * @param {Object(event_id, originalException, syntheticException)} hint
 * @param {FeatherApp} app
 * @returns {SentryEvent || undefined} Return modified sentry event, or undefined to skip sending event
 */
const removeIdMiddleware = (event, hint, app) => {
	// eslint-disable-next-line camelcase
	const { request: { data, url, query_string } } = event;

	event.request.data = replaceIds(data);
	event.request.url = replaceIds(url);
	event.request.query_string = replaceIds(query_string);
	return event;
};

const removeJwtToken = (event) => {
	delete event.request.headers.authorization;
	return event;
};

const logItMiddleware = (sendToSentry = false) => (event, hint, app) => {
	app.logger.info(
		'If you are not in development mode, the error is sent to sentry at this point! '
		+ 'If you actually want to send a real request to sentry, please modify sendToSentry.',
	);
	return sendToSentry ? event : null;
};

const filterByErrorCodesMiddleware = (...errorCode) => (event, hint, app) => {
	if (errorCode.includes(hint.originalException.code)) {
		return null;
	}
	return event;
};
/*
const filterByErrorMessageMiddleware = (...errorMessage) => (event, hint, app) => {
	if (errorMessage.includes(hint.originalException.message)) {
		return null;
	}
	return event;
};
*/
const skipItMiddleware = () => null;

module.exports = (app) => {
	const dsn = app.get('EDITOR_BACKEND_SENTRY_DSN');
	const environment = app.get('NODE_ENV');
	const release = app.get('version');

	if (dsn) {
		// middleware to modified events that, are post to sentry
		let middleware = [
			filterByErrorCodesMiddleware(404),
			removeIdMiddleware,
			removeJwtToken,
		];
		// for local test runs, post feedback
		if (environment === 'development') {
			middleware.push(logItMiddleware(false));
		}
		// do not execute for test runs
		if (environment === 'test') {
			middleware = [skipItMiddleware];
		}

		const runMiddlewares = (event, hint, index = 0) => {
			if (!event) {
				return event;
			}

			if (middleware.length === index) {
				return event;
			}

			const modifiedEvent = middleware[index](event, hint, app);
			return runMiddlewares(modifiedEvent, hint, index + 1);
		};

		systemInfo(`Sentry reporting enabled using DSN ${dsn}`);

		Sentry.init({
			dsn,
			environment,
			release,
			sampleRate: 1.0,
			beforeSend(event, hint) {
				const modifiedEvent = runMiddlewares(event, hint);
				return modifiedEvent;
			},
		});

		Sentry.configureScope((scope) => {
			scope.setTag('frontend', false);
			scope.setLevel('warning');
			scope.setTag('domain', app.get('SC_DOMAIN') || 'localhost');
			// scope.setTag('sha', sha); todo add it later
		});

		app.use(Sentry.Handlers.requestHandler());
	}
};
