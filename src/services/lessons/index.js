const service = require('feathers-mongoose');

const { lessonModel } = require('./models/');
const hooks = require('./hooks/');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: lessonModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('lessons', service(option));
	const lessonsService = app.service('lessons');
	lessonsService.hooks(hooks);
};
