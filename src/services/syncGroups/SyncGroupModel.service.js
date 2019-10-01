const service = require('feathers-mongoose');
const { disallow } = require('feathers-hooks-common');

const { SyncGroupModel } = require('./models/');

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

const SyncGroupModelService = (app) => {
	const option = {
		Model: SyncGroupModel,
		lean: true,
		paginate: {
			default: 50,
			max: 150,
		},
	};
	const path = 'models/syncGroup';
	app.use(path, service(option));
	const syncGroupModelService = app.service(path);
	syncGroupModelService.hooks(hooks);
};

module.exports = {
	SyncGroupModelService,
	hooks,
};
