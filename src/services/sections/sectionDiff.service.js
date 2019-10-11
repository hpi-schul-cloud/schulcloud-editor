const { diffToMongo } = require('./utils');

class SectionDiffService {
	constructor({ docs = {}, baseServiceName }) {
		this.docs = docs;
		this.baseServiceName = baseServiceName;
	}

	setup(app) {
		this.app = app;
	}

	/**
	 * @param {ObjectId} id
	 * @param {Object} diffData Convert diff data json request to mongoose query to insert it.
	 * @param {Object:FeatherParams} params
	 */
	patch(id, diffData, params) {
		params.isSectionDiffMongooseQuery = true;
		return this.app(this.baseServiceName).patch(id, diffToMongo(diffData), params);
	}
}

module.exports = {
	SectionDiffService,
};
