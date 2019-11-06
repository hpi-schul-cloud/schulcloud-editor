const { setupApplication, ServiceRoute } = require('./ServiceRoutes');

module.exports = (app) => {
	app.configure(setupApplication);
	const {
		server: {
			meUri,
			baseURL,
			coursePermissionsUri,
			courseMembersUri,
		},
		timeout,
	} = app.get('routes');

	app.serviceRoute('server/me', new ServiceRoute({
		baseURL,
		uri: meUri,
		timeout,
		allowedMethods: ['get'],
	}));

	app.serviceRoute('server/courses/userPermissions', new ServiceRoute({
		baseURL,
		uri: coursePermissionsUri,
		timeout,
		allowedMethods: ['get'],
	}));

	app.serviceRoute('server/courses/members', new ServiceRoute({
		baseURL,
		uri: courseMembersUri,
		timeout,
		allowedMethods: ['find'],
	}));
};
