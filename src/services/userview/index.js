const service = require('feathers-mongoose');

const { UserviewModel } = require('./models');
const hooks = require('./hooks');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: UserviewModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('userview', service(option));
	const userviewService = app.service('userview');
	userviewService.hooks(hooks);
};
