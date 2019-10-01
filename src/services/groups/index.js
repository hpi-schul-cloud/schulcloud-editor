const service = require('feathers-mongoose');

const { GroupModel } = require('./models/');
const hooks = require('./hooks/');

// todo add additional services for extern groups with names,
// or force that it can only add names over force event operation
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
	const groupsService = app.service('groups');
	groupsService.hooks(hooks);
};
