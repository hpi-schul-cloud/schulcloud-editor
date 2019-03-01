/* eslint-disable no-param-reassign */
const { NotFound, MethodNotAllowed } = require('@feathersjs/errors');
const { isArray, forceArray } = require('./collection');

const objectPathResolver = (context, path) => {
	if (path === undefined) {
		return context;
	}

	return path.split('.').reduce((contextElement, key) => {
		const next = contextElement[key];
		return next;
	}, context);
};

const filter = (path, keys) => (context) => {
	console.log('todo: filter');
	if (keys === undefined) {
		return context;
	}

	const copy = Object.assign({}, context);
	return copy;
};

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

const restricted = (restricts = 'owner') => (context) => {
	const { user } = context.params;
	if (typeof restricts === 'string') {
		context.params.query[restricts] = user;
	} else if (isArray(restricts)) {
		if (!context.params.query.$or) {
			context.params.query.$or = [];
		}
		restricts.forEach((key) => {
			context.params.query.$or.push({ [key]: user });
		});
	}
	return context;
};

const block = (context) => {
	throw new MethodNotAllowed();
};

module.exports = {
	exist,
	filter,
	restricted,
	objectPathResolver,
	block,
};
