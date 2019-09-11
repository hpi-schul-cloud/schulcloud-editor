/* eslint-disable no-param-reassign */
const { NotFound, MethodNotAllowed, Forbidden } = require('@feathersjs/errors');
const axios = require('axios');

const { forceArray } = require('./helpers');

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

const forceOwnerInData = (context) => {
	if (!context.data.owner) {
		context.data.owner = context.params.user;
	}
	return context;
};

/* eslint-disable no-param-reassign */
const filterOutResults = keys => (context) => {
	if (context.result && context.type === 'after' && context.params.provider === 'rest') {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}
		if (context.method === 'find' && Array.isArray(context.result.data)) {
			context.result.data.forEach((ele) => {
				keys.forEach((key) => {
					delete ele[key];
				});
			});
		} else {
			keys.forEach((key) => {
				delete context.result[key];
			});
		}
	}
	return context;
};


/**
 * Request Course service to get permissions
 *
 * @param {string} permission
 */
const checkCoursePermission = permission => async (context) => {
	const { params: { user, route: { courseId }, authorization }, app } = context;
	const { api, coursePermissions } = app.get('routes');
	const baseURL = (api + coursePermissions).replace(':courseId', courseId);
	const coursePermissionServices = axios.create({
		baseURL,
		timeout: 4000,
	});

	const { data: permissions } = await coursePermissionServices.get(user, {
		headers: {
			Authorization: authorization,
		},
	}).catch((err) => {
		if (err.response) {
			throw new Forbidden(err.response.statusText || 'You have no access.', err.response.data || err.response);
		}
		throw new Forbidden('You have no access.', err);
	});

	if (permissions.includes(permission)) {
		return context;
	}

	throw new Forbidden('You have no access.');
};

module.exports = {
	// exist,
	// filter,
	// objectPathResolver,
	block,
	// populate,
	// forceOwnerInData,
	filterOutResults,
	checkCoursePermission,
};
