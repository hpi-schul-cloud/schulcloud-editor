const Sentry = require('@sentry/node');

const { systemInfo } = require('../logger');

const replaceIds = (string) => {
	if (string) {
		return string.replace(/[a-f\d]{24}/ig, '[id]');
	}
	return string;
};

module.exports = (app) => {
	const DSN = app.get('EDITOR_BACKEND_SENTRY_DSN');
	if (DSN) {
		systemInfo(`Sentry reporting enabled using DSN ${DSN}`);
		Sentry.init({
			dsn: DSN,
			environment: app.get('NODE_ENV'),
			release: app.get('version'),
			integrations: [
				new Sentry.Integrations.Console({
					dsn: DSN,
				}),
			],
			beforeSend(event, hint) {
				// todo filter which errors should send to sentry
				// eslint-disable-next-line camelcase
				const { request: { data, url, query_string } } = event;

				event.request.data = replaceIds(data);
				event.request.url = replaceIds(url);
				event.request.query_string = replaceIds(query_string);

				app.logger.info('Error is send to sentry!');
				return event;
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
