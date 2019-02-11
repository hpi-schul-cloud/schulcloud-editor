const groups = require('./groups');
const documents = require('./documents');
const lessons = require('./lessons');

module.exports = function setup() {
	const app = this;

	app.configure(groups);
	app.configure(documents);
	app.configure(lessons);
};
