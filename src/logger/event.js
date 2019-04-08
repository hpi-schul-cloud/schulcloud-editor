module.exports = (logger, methods = []) => ({
	on, method, path, result, err, doc,
}) => {
	// trigger only if found elements exist
	if (doc.n > 0 && methods.includes(method)) {
		logger.info({
			timestamp: new Date(), on, method, path, result, err, doc,
		});
	}
};
