const service = require('feathers-mongoose');

const { sectionModel } = require('./models/');
const hooks = require('./hooks/');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: sectionModel,
		lean: true,
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('sections', service(option));
	const sectionsService = app.service('sections');
	sectionsService.hooks(hooks);
};
