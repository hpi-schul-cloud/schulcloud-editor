const service = require('feathers-mongoose');

const { AttachmentModel } = require('./models');
const hooks = require('./hooks');

module.exports = function setup() {
	const app = this;
	app.use('/attachments', service({
		Model: AttachmentModel,
		lean: true,
		paginate: {
			default: 10,
			max: 150,
		},
	}));
	const attachmentsService = app.service('attachments');
	attachmentsService.hooks(hooks); // TODO permissions
};
