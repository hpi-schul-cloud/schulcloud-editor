module.exports = (app) => {
	const key = process.env.EDITOR_MS_FORCE_KEY;
	if (!key) {
		app.logger.warning('EDITOR_MS_FORCE_KEY is not defined!');
	} else {
		app.logger.info('Set EDITOR_MS_FORCE_KEY!');
		app.set('forceKey', key);
	}
};
