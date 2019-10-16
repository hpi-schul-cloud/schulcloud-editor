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

module.exports = {
	addTypeString,
};
