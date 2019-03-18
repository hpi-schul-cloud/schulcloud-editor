const { SectionModel } = require('../../models');

const lessonRemoved = (app) => {
	app.service('lessons').on('removed', (result, context) => {
		const { method, path } = context;
		const on = 'sections';
		SectionModel.deleteMany({ lesson: context.id }).lean().exec((err, doc) => {
			app.logger({
				on, method, path, result, err, doc,
			});
		});
	});
};

module.exports = (app) => {
	lessonRemoved(app);
};
