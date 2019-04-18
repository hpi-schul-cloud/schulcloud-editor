
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
	if (!context.result.data) return context;
    // TODO: find a solution for converting
	const modifiedContext = context;
	modifiedContext.result.data = rekursiveIdRemover(context.result.data);

	return modifiedContext;
};

const clean = context => context;

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
	get: [removeIds, clean],
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
