const { AttachmentService, AttachmentServiceHooks } = require('./attachment.service');
const { AttachmentModelService } = require('./AttachmentModel.service');

module.exports = (app) => {
	app.configure(AttachmentModelService);

	const path = 'attachments';

	app.use(path, new AttachmentService({
		baseService: '/models/AttachmentModel',
		typesToModelServices: {
			lesson: '/models/LessonModel',
			section: '/models/SectionModel',
		},
	}));

	const externerService = app.service(path);
	externerService.hooks(AttachmentServiceHooks);
};
