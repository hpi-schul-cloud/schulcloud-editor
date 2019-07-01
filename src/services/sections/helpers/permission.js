const { BadRequest } = require('@feathersjs/errors');

/**
 * @returns permissions
 */
const getPermissions = (app, id, params) => app.service('sections')
	.get(id, params)
	.then(section => section.permissions)
	.catch((err) => {
		throw new BadRequest('Can not fetch section.', err);
	});

/**
 * @returns section
*/
const patchPermissions = (app, id, permissions, params) => app.service('sections')
	.patch(id, { permissions }, params)
	.catch((err) => {
		throw new BadRequest('Can not patch section.', err);
	});

module.exports = {
	getPermissions,
	patchPermissions,
};
