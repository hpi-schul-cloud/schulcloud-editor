
const { ObjectId } = require('mongoose').Types;

class UserInformation {
	constructor(options = {}) {
		this.options = options;
	}

	async get(id, params) {

		try {
			const lessonService = this.app.service('lessons');
			const modifiedParams = {
				...params,
			};

			const group = await lessonService.find(modifiedParams);


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
