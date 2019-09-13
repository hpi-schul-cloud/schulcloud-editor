const { Forbidden } = require('@feathersjs/errors');
const axios = require('axios');

const coursePermissions = (app, courseId, userId, authorization) => {
	const { server: { baseUrl, coursePermissionsUri }, timeout } = app.get('routes');
	const url = (baseUrl + coursePermissionsUri).replace(':courseId', courseId);
	const coursePermissionServices = axios.create({
		baseURL: url,
		timeout,
	});

	return coursePermissionServices.get(userId, {
		headers: {
			Authorization: authorization,
		},
	}).catch((err) => {
		if (err.response) {
			throw new Forbidden(err.response.statusText || 'You have no access.', err.response.data || err.response);
		}
		throw new Forbidden('You have no access.', err);
	});
};

module.exports = coursePermissions;
