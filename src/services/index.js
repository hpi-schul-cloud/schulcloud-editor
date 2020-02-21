const lessons = require('./lessons');
const groups = require('./groups');
const syncGroups = require('./syncGroups');
const sections = require('./sections');
const viewports = require('./viewports');
const permissionsHelper = require('./permissionsHelper');
const { systemInfo } = require('../logger');
const helpers = require('./helperServices');
// Events

module.exports = (app) => {
	/** first configure all services */
	app.configure(lessons);
	app.configure(groups);
	app.configure(syncGroups);
	app.configure(sections);
	app.configure(viewports);
	app.configure(helpers);

	app.configure(permissionsHelper.bind({
		modelService: 'models/LessonModel',
		baseService: 'course/:courseId/lessons',
	}));
	app.configure(permissionsHelper.bind({
		modelService: 'models/SectionModel',
		baseService: 'lesson/:lessonId/sections',
	}));
	app.configure(permissionsHelper.bind({
		baseService: 'viewports',
	}));

	// eslint-disable-next-line no-console
	systemInfo('Configure services completed!');
};
