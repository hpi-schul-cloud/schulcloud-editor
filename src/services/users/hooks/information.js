
const rekursiveIdRemover = (data) => {
	const modified = data;
	for (const x in modified) {
		if (Array.isArray(modified) || Object.prototype.hasOwnProperty.call(modified, x)) {
			let d = modified[x];
			if (Array.isArray(d)) {
				d = rekursiveIdRemover(d);
			} else if (typeof d === 'object' && d !== null) {
				if (Object.prototype.hasOwnProperty.call(d, '_bsontype') && d._bsontype === 'ObjectID') {
					delete modified[x];
				} else {
					d = rekursiveIdRemover(d);
				}
			}
		}
	}

	return modified;
};

const removeIds = (context) => {
	if (!context.result.data) {
		return context;
	}
	const modifiedContext = context;
	modifiedContext.result.data = rekursiveIdRemover(context.result.data);

	return modifiedContext;
};

exports.before = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],

};

exports.after = {
	all: [],
	find: [],
	get: [removeIds],
	create: [],
	update: [],
	patch: [],
	remove: [],

};

exports.error = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};
