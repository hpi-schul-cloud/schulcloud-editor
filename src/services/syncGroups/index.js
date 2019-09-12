const service = require('feathers-mongoose');

const { SyncGroup } = require('./models/');
const hooks = require('./hooks/');


module.exports = function setup() {
	const app = this;
	const option = {
		Model: SyncGroup,
		lean: true,
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('course/:courseId/groups', service(option));
	const courseGroupsService = app.service('course/:courseId/groups');
	courseGroupsService.hooks(hooks);
};
