const { SectionServiceHooks, SectionService } = require('./section.service');
const { SectionDiffService } = require('./sectionDiff.service');
const { SectionModelService } = require('./SectionModel.service');

module.exports = (app) => {
	app.configure(SectionModelService);

	const path = 'lesson/:lessonId/sections';
	const diffSuffix = '/diff';

	app.use(path, new SectionService({}));
	app.use(path + diffSuffix, new SectionDiffService({
		baseServiceName: path,
	}));

	const courseGroupsService = app.service(path);
	courseGroupsService.hooks(SectionServiceHooks);
};
