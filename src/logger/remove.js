module.exports = logger => ({
	on, method, path, result, err, doc,
}) => logger.info({
	timestamp: new Date(), on, method, path, result, err, doc,
});
