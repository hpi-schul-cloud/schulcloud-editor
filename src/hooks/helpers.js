const { BadRequest, NotFound } = require('@feathersjs/errors');

const objectPathResolver = (context, path) => {
	if (path === undefined) {
		return context;
	}

	return path.split('.').reduce((contextElement, key) => {
		const next = contextElement[key];
		return next;
	}, context);
};

const forceArray = keys => Array.isArray(keys) ? keys : [keys];
exports.forceArray = forceArray;

exports.objectPathResolver = objectPathResolver;

const filter = (path, keys) => (context) => {
	console.log('todo: filter');
	if (keys === undefined) {
		return context;
	}

	const copy = Object.assign({}, context);
	return copy;
};

exports.filter = filter;

const throwNotFoundIfTrue = (context, bool, path, keys) => {
	if (bool === true) {
		throw new NotFound('Missing input value', { path, keys });
	}
	return context;
};

const exist = (path, keys, executer = throwNotFoundIfTrue) => (context) => {
	if (keys === undefined) {
		return context;
	}

	const target = objectPathResolver(context, path);
	const isNotFound = forceArray(keys).some(key => target[key] === undefined);

	return executer(context, isNotFound, path, keys);
};

exports.exist = exist;
