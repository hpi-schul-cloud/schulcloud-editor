const { setupCoursePermissions } = require('./server.coursePermissions');
const { setupMe } = require('./server.me');

module.exports = (app) => {
	app.configure(setupCoursePermissions);
	app.configure(setupMe);
};
