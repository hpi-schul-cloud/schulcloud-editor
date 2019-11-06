// todo move to configure is is not a middleware operation
module.exports = (app) => {
	// eslint-disable-next-line no-console
	console.log('Set ping route.');
	app.get('/ping', (req, res) => {
		res.json({
			timestamp: new Date(),
			message: 'ok',
		});
	});
};
