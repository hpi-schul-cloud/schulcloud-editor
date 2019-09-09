const service = require('feathers-mongoose');

const { ViewportModel } = require('./models');
const hooks = require('./hooks');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: ViewportModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('viewports', service(option));
	const viewportService = app.service('viewports');
	viewportService.hooks(hooks);
};
