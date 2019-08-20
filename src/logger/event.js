module.exports = (logger, methods = []) => ({
	on, method, path, result, err, doc,
}) => {
	if (!methods.includes(method)) {
		return;
	}
	// trigger only if found elements exist
	if (doc.n > 0) {
		logger.info({
			request: {
				method, path, result: result._id,
			},
			action: {
				on, err, doc,
			},
		});
	} else if (doc._id) {
		logger.info({
			request: {
				method, path, result: result._id,
			},
			action: {
				on, err, doc: doc._id,
			},
		});
	}
};
