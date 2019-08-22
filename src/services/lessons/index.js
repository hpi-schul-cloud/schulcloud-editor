/* eslint-disable class-methods-use-this */
const { Lessons, hooks: lessonsHooks } = require('./lessons.service');

module.exports = function setup() {
	const app = this;
	app.use('/course/:courseId/lessons', new Lessons());
	const lessonsService = app.service('course/:courseId/lessons');
	lessonsService.hooks(lessonsHooks);
};
