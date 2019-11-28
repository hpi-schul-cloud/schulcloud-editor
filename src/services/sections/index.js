const { SectionServiceHooks, SectionService } = require('./section.service');
const { SectionDiffService } = require('./sectionDiff.service');
const { SectionModelService } = require('./SectionModel.service');
const { publishData } = require('../../utils/sockets');

module.exports = (app) => {
	app.configure(SectionModelService);

	const path = 'lesson/:lessonId/sections';
	const diffPath = `${path}/diff`;

	app.use(path, new SectionService({}));

	const sectionService = app.service(path);
	sectionService.publish('created', publishData(app, 'sections'));
	sectionService.publish('patched', publishData(app, 'sections'));
	sectionService.publish('removed', publishData(app, 'sections'));
	sectionService.hooks(SectionServiceHooks);
	app.use(diffPath, new SectionDiffService({
		baseServiceName: path,
	}));

	// const diffService = app.service(diffPath);
	// diffService.publish('patched', publishData(app, 'sections'));

	const courseGroupsService = app.service(path);
	courseGroupsService.hooks(SectionServiceHooks);
};
