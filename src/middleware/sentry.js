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

const logItMiddleware = (event, hint, app) => {
	if (event.environment === 'default') {
		app.logger.info('Error is send to sentry!');
	}
	return event;
};

const filterByErrorCodesMiddleware = (...errorCode) => (event, hint, app) => {
	if (errorCode.includes(hint.originalException.code)) {
		return undefined;
	}
	return event;
};

const skipItMiddleware = () => undefined;

module.exports = (app) => {
	const dsn = app.get('EDITOR_BACKEND_SENTRY_DSN');
	const environment = app.get('NODE_ENV');
	const release = app.get('version');

	if (dsn) {
		// middleware to modified events that, are post to sentry
		let middleware = [
			filterByErrorCodesMiddleware(404),
			removeIdMiddleware,
		];
		// for local test runs, post feedback
		if (environment === 'default') {
			middleware.push(logItMiddleware);
		}
		// do not execute for test runs
		if (environment === 'test') {
			middleware = [skipItMiddleware];
		}

		const runMiddlewares = (event, hint, index = 0) => {
			if (event === undefined) {
				return undefined;
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
			integrations: [
				new Sentry.Integrations.Console({}),
			],
			beforeSend(event, hint) {
				return runMiddlewares(event, hint);
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
