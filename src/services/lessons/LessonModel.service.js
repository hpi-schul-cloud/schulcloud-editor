const service = require('feathers-mongoose');
const { disallow } = require('feathers-hooks-common');

const { LessonModel } = require('./models/');
const { setCourseId } = require('./hooks/');

const hooks = {};
hooks.before = {
	all: [
		disallow('external'),
	],
	create: [
		setCourseId,
	],
	patch: [
	],
	remove: [
	],
	get: [
	],
	find: [
	],
};

const LessonModelService = (app) => {
	const option = {
		Model: LessonModel,
		lean: true,
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('models/LessonModel', service(option));
	const modelService = app.service('models/LessonModel');
	modelService.hooks(hooks);
};

module.exports = {
	LessonModelService,
	hooks,
};
