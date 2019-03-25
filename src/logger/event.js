module.exports = logger => ({
	on, method, path, result, err, doc,
}) => {
	// trigger only if found elements exist
	if (doc.n > 0) {
		logger.info({
			timestamp: new Date(), on, method, path, result, err, doc,
		});
	}
};
