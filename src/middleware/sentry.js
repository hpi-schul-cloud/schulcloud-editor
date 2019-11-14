const Sentry = require('@sentry/node');

const { systemInfo } = require('../logger');
const { version } = require('../../package.json');

const removeIds = (url) => {
	const checkForHexRegExp = /[a-f\d]{24}/ig;
	return url.replace(checkForHexRegExp, 'ID');
};

const middleware = (req, res, next) => {
	Sentry.configureScope((scope) => {
		// todo request combine with request params
		const { url, headers } = req;
		scope.request = { url: removeIds(url), headers };
	});
	// to test it: Sentry.captureMessage('Something went wrong');
	return next();
};

module.exports = (app) => {
	const DSN = app.get('EDITOR_BACKEND_SENTRY_DSN');
	if (DSN) {
		systemInfo(`Sentry reporting enabled using DSN ${DSN}`);
		Sentry.init({
			dsn: DSN,
			environment: app.get('NODE_ENV'),
			release: version,
			integrations: [
				new Sentry.Integrations.Console(),
			],
		});
		Sentry.configureScope((scope) => {
			scope.setTag('frontend', false);
			scope.setLevel('warning');
			scope.setTag('domain', app.get('SC_DOMAIN') || 'localhost');
			// scope.setTag('sha', sha); todo add it later
		});
		app.use(Sentry.Handlers.requestHandler());
		app.use(Sentry.Handlers.errorHandler());

		app.use(middleware);
	}
};
