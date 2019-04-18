
const { ObjectId } = require('mongoose').Types;

class UserInformation {
	constructor(options = {}) {
		this.options = options;
	}

	async get(id, params) {

		try {
			const groupService = this.app.service('lessons');
			const userId = params.headers.authorization;
			const modifiedParams = {
				...params,
			};

			const group = await groupService.find(params);


			return Promise.resolve(group);
		} catch (err) {
			return Promise.reject(err);
		}
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = UserInformation;
