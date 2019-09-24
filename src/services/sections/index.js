const { SectionServiceHooks, SectionService } = require('./section.service');
const { SectionModelService } = require('./SectionModel.service');

module.exports = (app) => {
	app.configure(SectionModelService);

	const path = 'sections';
	app.use(path, new SectionService({}));
	const courseGroupsService = app.service(path);
	courseGroupsService.hooks(SectionServiceHooks);
};
