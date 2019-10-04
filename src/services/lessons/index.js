/* eslint-disable class-methods-use-this */
const { Lessons, lessonsHooks, joinLessonChannel } = require('./lessons.service');
const { LessonModelService } = require('./LessonModel.service');

module.exports = function setup(app) {
	app.configure(LessonModelService);
	app.use('/course/:courseId/lessons', new Lessons({}));
	const lessonsService = app.service('course/:courseId/lessons');
	lessonsService.hooks(lessonsHooks);
	lessonsService.publish('patched', data =>
		app.channel(`lessons/${data.id}`).send(data));
	lessonsService.on('geted', joinLessonChannel);
};
