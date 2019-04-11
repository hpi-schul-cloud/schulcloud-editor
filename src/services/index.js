const groups = require('./groups');
const sections = require('./sections');
const lessons = require('./lessons');
const collections = require('./collections');
const attachments = require('./attachments');

const groupsEvents = require('./groups/events/');
const sectionsEvents = require('./sections/events/');
const lessonsEvents = require('./lessons/events/');
const collectionsEvents = require('./collections/events/');

module.exports = function setup() {
	const app = this;

	/** first configure all services */
	app.configure(groups);
	app.configure(sections);
	app.configure(lessons);
	app.configure(collections);
	app.configure(attachments);

	/** then execute the attach of all event listener */
	groupsEvents(app);
	sectionsEvents(app);
	lessonsEvents(app);
	collectionsEvents(app);
};
