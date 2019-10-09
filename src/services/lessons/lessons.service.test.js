const chai = require('chai');
let app = require('../../app');
const { TestHelper, ServerMock } = require('../../testHelpers');

const { expect } = chai;

describe.only('lessons/lessons.service.js', () => {
	let editor;
	let server;
	let helper;

	before((done) => {
		editor = app.listen(app.get('port'), done);
	});

	before(() => {
		server = new ServerMock();
		app = server.overrideRoutes(app);

		helper = new TestHelper(app);
		helper.registerServiceHelper({
			serviceName: '/course/:courseId/lessons',
			modelName: 'lesson',
		});
	});

	after(async () => {
		// todo cleanup sync groups
		await helper.cleanup();
		await editor.close();
	});

	it('create should work', async () => {
		const teacherIds = server.getUserIdsByRole('teacher');
		const courseIds = server.getCourseIds();

		const currentUser = teacherIds[0];
		const currentCourse = courseIds[0];
		const { status, data } = await app.serviceHelper('/course/:courseId/lessons')
			.sendRequestToThisService('create', {
				userId: currentUser,
				courseId: currentCourse,
			});

		expect(status).to.equal(201);
		expect(data).to.an('object');
		expect(Object.keys(data)).to.have.lengthOf(1);
		expect(data._id).to.a('string');
	});
});
