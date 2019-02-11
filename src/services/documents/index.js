const service = require('feathers-mongoose');

const { documentModel } = require('./models/');
const hooks = require('./hooks/');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: documentModel,
		lean: true,
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('documents', service(option));
	const documentService = app.service('documents');
	documentService.hooks(hooks);
};
