/* eslint-disable no-param-reassign */
/* eslint-disable object-curly-newline */
/* eslint-disable class-methods-use-this */
const { getPermissions, patchPermissions } = require('../helpers/');
const { sameId } = require('../../global').helpers;

/**
 * The getPermissions() function is save to use, it pass the params over section hooks.
 * Also you must not add additional permission hooks, for this class.
 * But be carfull if you remove getPermissions() in any method.
 */
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

		const permissions = await getPermissions(this.app, sectionId, params);
		permissions.push({
			group, read, write, create,
		});

		return patchPermissions(this.app, sectionId, permissions, params);
	}

	async patch(permissionId, { read, write, create }, params) {
		const { sectionId } = params.route;

		let permissions = await getPermissions(this.app, sectionId, params);
		permissions = permissions.map((permission) => {
			if (sameId(permission._id, permissionId)) {
				if (read) { permission.read = read; }
				if (write) { permission.write = write; }
				if (create) { permission.create = create; }
			}
			return permission;
		});

		return patchPermissions(this.app, sectionId, permissions, params);
	}

	async remove(permissionId, params) {
		const { sectionId } = params.route;

		let permissions = await getPermissions(this.app, sectionId, params);
		permissions = permissions.filter(permission => !sameId(permission._id, permissionId));

		return patchPermissions(this.app, sectionId, permissions, params);
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = Permission;
