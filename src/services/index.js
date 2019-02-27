const groups = require('./groups');
const sections = require('./sections');
const lessons = require('./lessons');

module.exports = function setup() {
	const app = this;

	app.configure(groups);
	app.configure(sections);
	app.configure(lessons);
};
