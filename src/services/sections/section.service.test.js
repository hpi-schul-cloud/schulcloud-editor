const chai = require('chai');
const app = require('../../app');
const { TestHelper } = require('../../testHelpers');

const { expect } = chai;

describe('sections/section.service.js', () => {
	let editor;
	let server;
	let helper;
	let sectionService;
	let lessonService;
	let syncGroupService;
	let userId;
	let courseId;
	let writePermission;
	let readPermission;

	before((done) => {
		editor = app.listen(app.get('port'), done);
	});

	before(() => {
		helper = new TestHelper(app);

		helper.registerServiceHelper({
			serviceName: 'lesson/:lessonId/sections',
			modelName: 'section',
		});
		sectionService = app.serviceHelper('lesson/:lessonId/sections');

		helper.registerServiceHelper({
			serviceName: '/course/:courseId/lessons',
			modelName: 'lesson',
		});
		lessonService = app.serviceHelper('/course/:courseId/lessons');

		helper.registerServiceHelper({
			serviceName: 'course/:courseId/lesson/:lessonId/groups',
			modelName: 'syncGroup',
		});
		syncGroupService = app.serviceHelper('course/:courseId/lesson/:lessonId/groups');

		userId = helper.createObjectId();
		courseId = helper.createObjectId();

		writePermission = helper.createPermission({ users: [userId], write: true });
		readPermission = helper.createPermission({ users: [userId], read: true });
	});

	after(async () => {
		await helper.cleanup();
		await editor.close();
	});

	it('create with write permissions should work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData(writePermission, { courseId });
		await syncGroupService.createWithDefaultData({
			users: [userId], permission: 'write', lessonId,
		});

		const { status, data } = await sectionService.sendRequestToThisService('create', { userId, lessonId });

		// todo test if lesson sections is updated
		expect(status).to.equal(201);
		expect(data).to.an('object');
		expect(Object.keys(data)).to.have.lengthOf(1);
		expect(data._id).to.a('string');
		expect(data).to.not.have.property('permissions');
	});

	it('create with read permissions should not work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData(readPermission, { courseId });
		await syncGroupService.createWithDefaultData({
			users: [userId], permission: 'read', lessonId,
		});

		const { status } = await sectionService.sendRequestToThisService('create', { userId, lessonId });

		expect(status).to.equal(403);
	});
});
