module.exports = (app) => {
	app.get('/ping', (req, res) => {
		res.json({
			timestamp: new Date(),
			message: 'ok',
		});
	});
	app.logger.info('Set ping route.');
};
