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


// todo restricted to groups ..populate id?


const block = () => {
	throw new MethodNotAllowed();
};

const populate = paths => (context) => {
	if (!context.params.query.$populate) {
		context.params.query.$populate = [];
	}
	forceArray(paths).forEach((path) => {
		context.params.query.$populate.push({ path });
	});

	return context;
};

const forceOwner = (context) => {
	context.data.owner = context.params.user;
	return context;
};

module.exports = {
	exist,
	filter,
	objectPathResolver,
	block,
	populate,
	forceOwner,
};
