const { GroupModel } = require('../../models');

const lessonRemoved = (app) => {
	app.service('lessons').on('removed', (result, context) => {
		const { method, path } = context;
		GroupModel.deleteMany({ lesson: context.id }).lean().exec((err, doc) => {
			console.log({
				method, path, result, err, doc,
			});
		});
	});
};

module.exports = (app) => {
	lessonRemoved(app);
};
