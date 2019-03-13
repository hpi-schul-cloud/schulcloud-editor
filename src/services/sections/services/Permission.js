/* eslint-disable class-methods-use-this */
const { getPermissions, patchPermissions } = require('../helpers/');
const { sameId } = require('../../../global/collection');

class Permission {
	constructor(options) {
		this.options = options || {};
		this.docs = {};
	}

	/**
	 * @param read Can read a section.
	 * @param write Can edit a section, but can not modified the structure. Example: student answer a question.
	 * @param create Can edit a section structure. Example: teacher can create and edit new answers.
	 * @example {read:false, write:true, create:true} will allow you create new answers AND edit this answers. Read is override by the higher permissions.
	 */
	async create({ group, read, write, create }, params) {
		const { sectionId } = params.route;
		const { app } = this;

		const permissions = await getPermissions(app, sectionId, params);
		permissions.push({
			group, read, write, create,
		});

		return patchPermissions(app, sectionId, permissions, params);
	}

	async remove(permissionId, params) {
		const { sectionId } = params.route;
		const { app } = this;

		let permissions = await getPermissions(app, sectionId, params);
		permissions = permissions.filter(permission => !sameId(permission._id, permissionId));

		return patchPermissions(app, sectionId, permissions, params);
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = Permission;
