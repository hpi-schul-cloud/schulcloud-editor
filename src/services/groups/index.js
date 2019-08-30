const service = require('feathers-mongoose');

const { GroupModel } = require('./models/');
const hooks = require('./hooks/');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: GroupModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('groups', service(option));
	const lessonsService = app.service('groups');
	lessonsService.hooks(hooks);
};
