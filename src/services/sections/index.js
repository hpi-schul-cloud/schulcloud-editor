const service = require('feathers-mongoose');

const { SectionModel, SectionAttachmentModel } = require('./models/');
const hooks = require('./hooks/');
const permissionHooks = require('./hooks/permissionHooks');
const { Permission } = require('./services');


module.exports = function setup() {
	const app = this;
	app.use('sections/attachments', service({
		Model: SectionAttachmentModel,
		lean: true,
		paginate: {
			default: 10,
			max: 150,
		},
	}));
	const sectionAttachmentsService = app.service('sections/attachments');
	// sectionAttachmentsService.hooks(hooks); // TODO permissions
	
	const option = {
		Model: SectionModel,
		lean: true,
		paginate: {
			default: 50,
			max: 150,
		},
	};
	app.use('sections', service(option));
	const sectionsService = app.service('sections');
	sectionsService.hooks(hooks);


	const permissionRoute = 'sections/:sectionId/permissions';
	app.use(permissionRoute, new Permission());
	const permissionsService = app.service(permissionRoute);
	permissionsService.hooks(permissionHooks);
};
