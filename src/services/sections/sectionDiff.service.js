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
	 * Convert diff data json request to mongoose query to insert it.
	 *
	 * @param {ObjectId} id
	 * @param {Object} data
	 * @param {Object:FeatherParams} params
	 */
	async patch(id, data, params) {
		params.isSectionDiffMongooseQuery = true;
		await this.app.service(this.baseServiceName).patch(id, diffToMongo(data.state, 'state'), params);
		return {
			_id: id,
			diff: data.state,
		};
	}
}

module.exports = {
	SectionDiffService,
};
