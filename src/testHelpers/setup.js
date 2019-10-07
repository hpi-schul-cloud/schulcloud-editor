const TestHelper = require('./testHelper');
const ServerMock = require('./ServerMock');

module.exports = (app) => {
	app.logger.info('<<< test setup is added >>>');
	const testHelper = new TestHelper(app);
	testHelper.registerServiceHelper({
		serviceName: '/course/:courseId/lessons',
		modelName: 'lesson',
	});

	testHelper.registerServiceHelper({
		serviceName: '/lesson/:lessonId/sections',
		modelName: 'section',
	});

	setTimeout(async () => {
		const server = new ServerMock(app);

		await app.serviceHelper('/course/:courseId/lessons')
			.sendRequestToThisService('get', {
				id: '5d971ae22257b01af46d3ef3',
				userId: '0000d231816abba584714c9e',
				courseId: '0000dcfbfb5c7a3f00bf21ab',
			}).then((res) => {
				console.log(res);
			});


		await app.serviceHelper('/course/:courseId/lessons')
			.sendRequestToThisService('patch', {
				id: '5d971ae22257b01af46d3ef3',
				userId: '0000d231816abba584714c9e',
				courseId: '0000dcfbfb5c7a3f00bf21ab',
				data: {
					title: '1233',
				},
			}).then((res) => {
				console.log(res);
			});

		await app.serviceHelper('/lesson/:lessonId/sections')
			.sendRequestToThisService('get', {
				id: '5d9739b10ac2111da4c59bfb',
				userId: '0000d231816abba584714c9e',
				lessonId: '5d84829287a99413b80d8fda',
				data: {
					state: {
						bla: 123,
					},
				},
			}).then((res) => {
				console.log(res);
			});

		await app.serviceHelper('/lesson/:lessonId/sections')
			.sendRequestToThisService('create', {
				userId: '0000d231816abba584714c9e',
				lessonId: '5d84829287a99413b80d8fda',
				data: {
					state: {
						bla: 123,
					},
				},
			}).then((res) => {
				console.log(res);
			});

		const a = 123;
	}, 2000);
};
