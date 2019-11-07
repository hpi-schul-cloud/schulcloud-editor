module.exports = logger => req => logger.info({
	userId: req.feathers.userId,
	url: req.url,
	data: req.body,
	method: req.method,
});
