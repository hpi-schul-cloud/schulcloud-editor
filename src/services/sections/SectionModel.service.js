const service = require('feathers-mongoose');
const { disallow } = require('feathers-hooks-common');

const { SectionModel } = require('./models/');

const SectionModelServiceHooks = {};
SectionModelServiceHooks.before = {
	all: [disallow('external')],
	find: [],
	get: [],
	create: [],
	update: [disallow()],
	patch: [],
	remove: [],
};

const SectionModelService = (app) => {
	const option = {
		Model: SectionModel,
		lean: true,
		paginate: {
			default: 50,
			max: 150,
		},
		whitelist: ['$elemMatch'],
	};
	const path = 'models/SectionModel';
	app.use(path, service(option));
	const sectionServices = app.service(path);
	sectionServices.hooks(SectionModelServiceHooks);
};

module.exports = {
	SectionModelServiceHooks,
	SectionModelService,
};
