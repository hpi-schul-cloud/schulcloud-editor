const { SyncGroupsServiceHooks, SyncGroupsService } = require('./syncGroups.service');
const { SyncGroupModelService } = require('./SyncGroupModel.service');

module.exports = (app) => {
	app.configure(SyncGroupModelService);

	const path = 'course/:courseId/lesson/:lessonId/groups';
	app.use(path, new SyncGroupsService({}));
	const courseGroupsService = app.service(path);
	courseGroupsService.hooks(SyncGroupsServiceHooks);
};
