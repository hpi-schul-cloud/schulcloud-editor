/* eslint-disable no-underscore-dangle */
const { PermissionService, permissionServiceHooks } = require('./Permission.service');
const { ProxyService } = require('./Proxy.service');
const { filterOutResults } = require('../../global/hooks');
const {
	addReferencedData, baseServicesAccess,
} = require('./hooks');

module.exports = function setup(app) {
	const { baseService, permissionKey = 'permissions' } = this;
	const pathMin = `${baseService}/:ressourceId`;
	const path = `${pathMin}/permission`;

	app.use(path, new PermissionService({
		baseService,
		permissionKey,
	}));

	permissionServiceHooks.before.all.unshift(addReferencedData(baseService, permissionKey));

	const permissionService = app.service(path);
	permissionService.hooks(permissionServiceHooks);

	app.use(`${pathMin}/write`, new ProxyService({
		path,
		permission: 'write',
	}));

	app.use(`${pathMin}/read`, new ProxyService({
		path,
		permission: 'read',
	}));


	const serviceToModified = app.service(baseService);
	['create', 'find', 'get', 'patch', 'remove', 'update'].forEach((method) => {
		// add after filter that remove the embedded permissions in baseServices
		serviceToModified.__hooks.after[method].push(filterOutResults(permissionKey));
		// add access check in baseServices as first place in before all
		const access = ['get', 'find'].includes(method) ? 'read' : 'write';
		serviceToModified.__hooks.before[method].unshift(baseServicesAccess(pathMin, access));
	});


	app.logger.info(`Permission services is adding add ${path} with key ${permissionKey}.`);
};
