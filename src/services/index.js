// Services
const lessons = require('./lessons');
const groups = require('./groups');
const sections = require('./sections');
const viewports = require('./viewports');
const permissionsHelper = require('./permissionsHelper');
// Events

module.exports = function setup() {
	const app = this;

	/** first configure all services */
	app.configure(lessons);
	app.configure(permissionsHelper.bind({ baseService: 'lessons' }));
	app.configure(groups);
	app.configure(sections);
	app.configure(viewports);
	/** then configure all event listener */
};
