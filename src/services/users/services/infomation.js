

class UserInformation {
	constructor(options = {}) {
		this.options = options;
	}

	async get(id, params) {
		this.app.service('lessons')
			.find({ owner: id })
			.then((value) => {
				console.log(value.title);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = UserInformation;
