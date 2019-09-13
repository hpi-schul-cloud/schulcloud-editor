const { SyncGroupsServiceHooks, SyncGroupsService } = require('./syncGroups.service');
const { SyncGroupModelService } = require('./SyncGroupModel.service');

module.exports = function setup(app) {
	app.configure(SyncGroupModelService);

	app.use('course/:courseId/groups', new SyncGroupsService());
	const courseGroupsService = app.service('course/:courseId/groups');
	courseGroupsService.hooks(SyncGroupsServiceHooks);
};
