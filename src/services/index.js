const groups = require('./groups');
const sections = require('./sections');
const lessons = require('./lessons');
const collections = require('./collections');

module.exports = function setup() {
	const app = this;

	app.configure(groups);
	app.configure(sections);
	app.configure(lessons);
	app.configure(collections);
};
