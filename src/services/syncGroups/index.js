const { SyncGroupsServiceHooks, SyncGroupsService } = require('./syncGroups.service');
const { SyncGroupModelService } = require('./SyncGroupModel.service');

module.exports = function setup(app) {
	app.configure(SyncGroupModelService);

	const path = 'lessons/:lessonId/groups';
	app.use(path, new SyncGroupsService());
	const courseGroupsService = app.service(path);
	courseGroupsService.hooks(SyncGroupsServiceHooks);
};
