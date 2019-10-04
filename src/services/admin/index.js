class AdminService {
	constructor({ docs = {} }) {
		this.docs = docs;
	}

	

	setup(app) {
		this.app = app;
	}
}

module.exports = AdminService;
