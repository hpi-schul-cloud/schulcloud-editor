/* eslint-disable no-param-reassign */
const { MethodNotAllowed, Forbidden } = require('@feathersjs/errors');
const axios = require('axios');

const block = () => {
	throw new MethodNotAllowed();
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
	const {
		params: {
			user, provider, route: { courseId }, authorization,
		},
		app,
	} = context;

	if (!(provider === 'rest')) {
		return context;
	}

	const { api, coursePermissions } = app.get('routes');
	const baseURL = (api + coursePermissions).replace(':courseId', courseId); // todo wrapper in routes that can request over get(couseId)?
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
	block,
	filterOutResults,
	checkCoursePermission,
};
