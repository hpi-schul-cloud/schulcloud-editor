/* eslint-disable class-methods-use-this */
const { Lessons, lessonsHooks, joinLessonChannel } = require('./lessons.service');
const { LessonModelService } = require('./LessonModel.service');
const { publishData } = require('../../utils/sockets');

module.exports = function setup(app) {
	const path = '/course/:courseId/lessons';
	app.configure(LessonModelService);
	app.use(path, new Lessons({}));
	const lessonsService = app.service(path);
	lessonsService.hooks(lessonsHooks);

	lessonsService.publish('patched', publishData(app, 'lessons'));
	lessonsService.publish('removed', publishData(app, 'lessons'));
	lessonsService.on('geted', joinLessonChannel);
};
