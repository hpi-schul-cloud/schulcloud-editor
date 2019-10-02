const TestHelper = require('./testHelper');

module.exports = (app) => {
	app.logger.info('<<< test setup is added >>>');
	const testHelper = new TestHelper(app);
	testHelper.registerServiceHelper({
		serviceName: '/course/:courseId/lessons',
		modelName: 'lesson',
	});
	// app.testService('lesson').get('');
};
