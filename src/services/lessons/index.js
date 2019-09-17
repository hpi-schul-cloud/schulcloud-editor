/* eslint-disable class-methods-use-this */
const { Lessons, hooks: lessonsHooks, joinLessonChannel } = require('./lessons.service');

module.exports = function setup() {
	const app = this;
	app.use('/course/:courseId/lessons', new Lessons());
	const lessonsService = app.service('course/:courseId/lessons');
	lessonsService.hooks(lessonsHooks);
	lessonsService.publish('patched', data => app.channel(`lesson/${data.id}`).send(data));
	lessonsService.on('getted', joinLessonChannel);
};
