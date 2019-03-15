const { GroupModel } = require('../../models');

const lessonRemoved = (app) => {
	app.service('lessons').on('removed', (result, context) => {
		const { method, path } = context;
		const on = 'groups';
		GroupModel.deleteMany({ lesson: context.id }).lean().exec((err, doc) => {
			console.log({
				on, method, path, result, err, doc,
			});
		});
	});
};

module.exports = (app) => {
	lessonRemoved(app);
};
