class SectionDiffService {
	constructor({ docs = {}, baseServiceName }) {
		this.docs = docs;
		this.baseServiceName = baseServiceName;
	}

	setup(app) {
		this.app = app;
	}

	patch(id, data, params) {
		return this.app(this.baseServiceName).patch(id, data, params);
	}
}

module.exports = {
	SectionDiffService,
};
