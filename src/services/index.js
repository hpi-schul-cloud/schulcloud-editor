// Services
const lessons = require('./lessons');
const groups = require('./groups');
const syncGroups = require('./syncGroups');
const sections = require('./sections');
const viewports = require('./viewports');
const permissionsHelper = require('./permissionsHelper');
// Events

module.exports = function setup() {
	const app = this;

	/** first configure all services */
	app.configure(lessons);
	//app.configure(permissionsHelper.bind({ baseService: 'course/:courseId/lessons' }));
	app.configure(groups);
	app.configure(syncGroups);
	app.configure(sections);
	app.configure(permissionsHelper.bind({ baseService: 'sections' }));
	app.configure(viewports);
	app.configure(permissionsHelper.bind({ baseService: 'viewports' }));
	/** then configure all event listener */
};
