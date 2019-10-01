module.exports = logger => req => logger.info({
	userId: req.feathers.userId,
	force: req.feathers.force,
	url: req.url,
	data: req.body,
	method: req.method,
});
