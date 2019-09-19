// models after
const addTypeString = name => (docs, next) => {
	if (!docs) {
		next();
	}
	if (Array.isArray(docs)) {
		docs = docs.map((doc) => {
			doc.type = name;
			return doc;
		});
	} else {
		docs.type = name;
	}

	next();
};

/**
 * Create a copy from params with all user informations
 * But is is marked the params as intern request.
 * It clear the requested query and add deletedAt: { $exists: false };
 * @param {*} params
 * @return params
 */
const copyParams = (params) => {
	const copy = Object.assign({}, params);
	copy.query = {
		deletedAt: undefined,
	};
	copy.provider = undefined;
	return copy;
};


module.exports = {
	addTypeString,
	copyParams,
};
