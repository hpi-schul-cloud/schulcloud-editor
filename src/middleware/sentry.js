const Sentry = require('@sentry/node');

const { systemInfo } = require('../logger');
const { version } = require('../../package.json');

const removeIds = (url) => {
	const checkForHexRegExp = /[a-f\d]{24}/ig;
	return url.replace(checkForHexRegExp, 'ID');
};

module.exports = (app) => {
	const dns = app.get('EDITOR_BACKEND_SENTRY_DSN');
	if (process.env.dns) {
		systemInfo('Sentry reporting enabled using DSN', dns);
		Sentry.init({
			dsn: dns,
			environment: app.get('NODE_ENV'),
			release: version,
			integrations: [
				new Sentry.Integrations.Console(),
			],
		});
		Sentry.configureScope((scope) => {
			scope.setTag('frontend', false);
			scope.setLevel('warning');
			scope.setTag('domain', app.get('baseEditorUrl'));
			// scope.setTag('sha', sha); todo add it later
		});
		app.use(Sentry.Handlers.requestHandler());
		app.use(Sentry.Handlers.errorHandler());

		app.use((req, res, next) => {
			Sentry.configureScope((scope) => {
				// todo add schoolId if logged in
				const { url, header } = req;
				scope.request = { url: removeIds(url), header };
			});
			return next();
		});
	}
};
