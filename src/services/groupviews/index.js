const service = require('feathers-mongoose');

const { GroupViewModel } = require('./models');
const hooks = require('./hooks');

module.exports = (app) => {
	const option = {
		Model: GroupViewModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('groupview', service(option));
	const groupviewService = app.service('groupview');
	groupviewService.hooks(hooks);
};
