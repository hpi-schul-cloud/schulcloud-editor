const aggregateAppVars = (app) => {
	const protocol = app.get('protocol');
	const host = app.get('host');
	const port = app.get('port');
	app.set('baseEditorUrl', `${protocol}://${host}:${port}`);
};

module.exports = (app) => {
	app.logger.info('Aggregate app vars.');
	app.configure(aggregateAppVars);
};
