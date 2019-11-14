const configuration = require('@feathersjs/configuration');

const { systemInfo } = require('../logger');

const aggregateAppVars = (app) => {
	const protocol = app.get('protocol');
	const host = app.get('host');
	const port = app.get('port');
	app.set('baseEditorUrl', `${protocol}://${host}:${port}`);

	systemInfo('\n******************** env *********************');

	systemInfo('\nFrom aggregation:');
	systemInfo('baseEditorUrl', app.get('baseEditorUrl'));

	systemInfo('\nFrom process.env:');
	['NODE_CONFIG_DIR', 'NODE_ENV', 'EDITOR_BACKEND_SENTRY_DSN', 'SC_DOMAIN']
		.forEach((key) => {
			app.set(key, process.env[key]);
			systemInfo(`${key} ${app.get(key)}`);
		});

	systemInfo('\nFrom config file:');
	systemInfo(configuration()());
	systemInfo('\n');
};

module.exports = (app) => {
	app.configure(aggregateAppVars);
};
