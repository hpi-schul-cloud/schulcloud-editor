const { Forbidden, BadRequest } = require('@feathersjs/errors');
const { joinChannel: joinChannelLoop } = require('../utils/sockets');

const filterOutResults = (...keys) => (context) => {
	if (context.result && context.type === 'after') {
		// todo pagination test and switch to context.result.data
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
 * @param {String || ...Strings} allowedPermissions
 */
const checkCoursePermission = (...allowedPermissions) => async (context) => {
	const {
		params: {
			user, route: { courseId }, authorization,
		},
		app,
	} = context;

	const permissions = await app.serviceRoute('server/courses/userPermissions')
		.get(user.id, authorization, { courseId });

	if (permissions.isAxiosError || !Array.isArray(permissions)) {
		throw new BadRequest('Can not request server.', permissions);
	}

	if (!allowedPermissions.some(perm => permissions.includes(perm))) {
		throw new Forbidden('Missing privileges');
	}

	return context;
};

const joinChannel = (prefix, sufixId = '_id') => (context) => {
	const { app, result, params } = context;

	if (params.provider !== 'socketio') { return context; }

	const { connections } = app
		.channel(app.channels)
		.filter(connection => connection.userId === params.user.id);


	if (result[sufixId]) {
		connections.forEach(joinChannelLoop(app, prefix, result[sufixId]));
	} else if (result.data && Array.isArray(result.data)) {
		result.data.forEach(element => connections
			.forEach(joinChannelLoop(app, prefix, element[sufixId])));
	} else if (Array.isArray(result)) {
		result.forEach(element => connections
			.forEach(joinChannelLoop(app, prefix, element[sufixId])));
	} else {
		throw new Error('The result object did not match, please implement a new one');
	}

	return context;
};

const createChannel = (prefix, { from, prefixId }) => (context) => {
	const { app, result, params } = context;

	if (params.provider !== 'socketio') { return context; }
	const { connections } = app.channel(`${from}/${result[prefixId]}`);

	connections.forEach(joinChannelLoop(app, prefix, result._id));

	return context;
};

module.exports = {
	filterOutResults,
	checkCoursePermission,
	joinChannel,
	createChannel,
};
