const configuration = require('@feathersjs/configuration');

const { version } = require('../../package.json');
const { systemInfo } = require('../logger');

const aggregateAppVars = (app) => {
	const protocol = app.get('protocol');
	const host = app.get('host');
	const port = app.get('port');
	app.set('baseEditorUrl', `${protocol}://${host}:${port}`);

	app.set('version', version);

	systemInfo('\n******************** env *********************');

	systemInfo('\nFrom aggregation:');
	systemInfo(`baseEditorUrl ${app.get('baseEditorUrl')}`);
	systemInfo(`version ${app.get('version')}`);

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
