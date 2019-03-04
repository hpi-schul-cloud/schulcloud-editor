const service = require('feathers-mongoose');

const { collectionModel } = require('./models/');
const hooks = require('./hooks/');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: collectionModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('collections', service(option));
	const collectionService = app.service('collections');
	collectionService.hooks(hooks);
};
