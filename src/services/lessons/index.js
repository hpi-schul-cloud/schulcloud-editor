const service = require('feathers-mongoose');

const { LessonModel } = require('./models/');
const hooks = require('./hooks/');

module.exports = function setup() {
	const app = this;
	const option = {
		Model: LessonModel,
		lean: true, // set to false if you want Mongoose documents returned
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('lessons', service(option));
	const lessonsService = app.service('lessons');
	lessonsService.on('get', message => {
		console.log(message);
	});
	lessonsService.on('created', message => {
		console.log(message);
	});
	lessonsService.hooks(hooks);
};
