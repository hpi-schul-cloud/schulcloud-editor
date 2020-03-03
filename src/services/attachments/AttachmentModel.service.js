const service = require('feathers-mongoose');
const { disallow } = require('feathers-hooks-common');

const { AttachmentModel } = require('./models');

const hooks = {};
hooks.before = {
	all: [
		disallow('external'),
	],
	create: [
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

const AttachmentModelService = (app) => {
	const option = {
		Model: AttachmentModel,
		lean: true,
		paginate: {
			default: 150,
			max: 250,
		},
		whitelist: ['$elemMatch'],
	};
	app.use('models/AttachmentModel', service(option));
	const modelService = app.service('models/AttachmentModel');
	modelService.hooks(hooks);
};

module.exports = {
	AttachmentModelService,
	hooks,
};
