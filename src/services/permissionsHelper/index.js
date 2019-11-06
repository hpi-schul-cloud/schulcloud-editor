/* eslint-disable no-underscore-dangle */
const { PermissionService, permissionServiceHooks } = require('./Permission.service');

module.exports = function setup(app) {
	const {
		baseService,
		permissionKey = 'permissions',
		modelService,
	} = this;

	const permissionUri = '/:ressourceId/permission';
	const path = `${baseService}${permissionUri}`;

	app.use(path, new PermissionService({
		baseService,
		modelService,
		permissionKey,
		permissionUri,
	}));

	const permissionService = app.service(path);
	permissionService.hooks(permissionServiceHooks);

	// eslint-disable-next-line no-console
	console.log(`Permission services is adding add ${path} with key ${permissionKey}.`);
};
