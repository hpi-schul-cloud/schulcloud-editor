const service = require('feathers-mongoose');

const { groupModel } = require('./models/');
const hooks = require('./hooks/');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: groupModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('groups', service(option));
	const groupService = app.service('groups');
	groupService.hooks(hooks);
};
