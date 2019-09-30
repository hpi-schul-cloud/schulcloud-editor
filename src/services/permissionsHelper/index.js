/* eslint-disable no-underscore-dangle */
const { PermissionService, permissionServiceHooks } = require('./Permission.service');
const { ProxyService } = require('./Proxy.service');
const { filterOutResults } = require('../../global/hooks');
const { baseServicesAccess } = require('./hooks');

module.exports = function setup(app) {
	const {
		baseService,
		permissionKey = 'permissions',
	//	doNotProtect = [],
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

	/*
	const writeShortPath = path.replace('permission', 'write');
	app.use(writeShortPath, new ProxyService({
		path,
		permission: 'write',
		modelService,
		permissionKey,
	}));

	const readShortPath = path.replace('permission', 'read');
	app.use(readShortPath, new ProxyService({
		path,
		permission: 'read',
		modelService,
		permissionKey,
	}));
*/
	const permissionService = app.service(path);
	permissionService.hooks(permissionServiceHooks);

	/*
	const serviceToModified = app.service(baseService);
	['create', 'find', 'get', 'patch', 'remove', 'update'].forEach((method) => {
		// validate and persist service hooks stucture
		if (!Array.isArray(serviceToModified.__hooks.after[method])) {
			serviceToModified.__hooks.after[method] = [];
		}
		if (!Array.isArray(serviceToModified.__hooks.before[method])) {
			serviceToModified.__hooks.after[method] = [];
		}
		// add after filter that remove the embedded permissions in baseServices
		serviceToModified.__hooks.after[method].push(filterOutResults(permissionKey));
		// add access check in baseServices as first place in before all, exclude all not protected methods
		if (!doNotProtect.includes(method)) {
			const access = ['get', 'find'].includes(method) ? 'read' : 'write';
			const permissionShortPath = path.replace('permission', access);
			serviceToModified.__hooks.before[method].unshift(baseServicesAccess(permissionShortPath));
		}
	});
*/
	app.logger.info(`Permission services is adding add ${path} with key ${permissionKey}.`);
};
