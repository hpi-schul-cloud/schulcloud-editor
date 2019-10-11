const chai = require('chai');
let app = require('../../app');
const { TestHelper, ServerMock } = require('../../testHelpers');

const { expect } = chai;

describe('lessons/lessons.service.js', () => {
	let editor;
	let server;
	let helper;
	let service;
	let userId;
	let courseId;

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

		service = app.serviceHelper('/course/:courseId/lessons');

		const teacherIds = server.getUserIdsByRole('teacher');
		userId = teacherIds[0];

		const courseIds = server.getCourseIds();
		courseId = courseIds[0];
	});

	after(async () => {
		// todo cleanup sync groups
		await helper.cleanup();
		await editor.close();
	});

	it('create should work', async () => {
		const { status, data } = await service.sendRequestToThisService('create', { userId, courseId });

		// todo wait if member of is worked and is implemented, after it this test should not fail
		const { status: getStatus, data: getData } = await service.sendRequestToThisService('get', {
			id: data._id, userId, courseId,
		});

		expect(status).to.equal(201);
		expect(data).to.an('object');
		expect(Object.keys(data)).to.have.lengthOf(1);
		expect(data._id).to.a('string');
		expect(data).to.not.have.property('permissions');

		// test if permissions created
		expect(getStatus).to.equal(200);
		expect(getData).to.an('object');
		expect(getData._id.toString()).to.equal(data._id.toString());

		// todo test if syncGroups are created
	});

	it('get with write permission should work', async () => {
		const writePermission = helper.createPermission({ users: [userId], write: true });
		const lesson = await service.createWithDefaultData(writePermission, { courseId });
		const { _id: id, title } = lesson;

		const { status, data } = await service.sendRequestToThisService('get', { id, userId, courseId });

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data._id).to.equal(id.toString());
		expect(data.title).to.equal(title);
		expect(data.courseId).to.equal(courseId);
		expect(data.sections).to.have.lengthOf(0);
		expect(data).to.not.have.property('permissions');
	});

	it('get with read permission should work', async () => {
		const writePermission = helper.createPermission({ users: [userId], read: true });
		const lesson = await service.createWithDefaultData(writePermission, { courseId });
		const { _id: id, title } = lesson;

		const { status, data } = await service.sendRequestToThisService('get', { id, userId, courseId });

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data._id).to.equal(id.toString());
		expect(data.title).to.equal(title);
		expect(data.courseId).to.equal(courseId);
		expect(data.sections).to.have.lengthOf(0);
		expect(data).to.not.have.property('permissions');
	});


	it('find should work', async () => {
		const randomCourseId = helper.createObjectId();
		const writePermission = helper.createPermission({ users: [userId], write: true });
		const readPermission = helper.createPermission({ users: [userId], read: true });

		await Promise.all([
			service.createWithDefaultData(writePermission, { courseId: randomCourseId }),
			service.createWithDefaultData(readPermission, { courseId: randomCourseId }),
			service.createWithDefaultData([], { courseId: randomCourseId }),
		]);

		const { status, data } = await service.sendRequestToThisService('find', { userId, courseId: randomCourseId });

		expect(status).to.equal(200);
		expect(data).to.have.all.keys('total', 'limit', 'skip', 'data'); // paginated
		expect(data.data).to.have.lengthOf(2);
		expect(data.data[0]).to.not.have.property('permissions');
	});

	// todo find sortierung and paginations

	it('patch with write permission should work', async () => {
		const writePermission = helper.createPermission({ users: [userId], write: true });
		const lesson = await service.createWithDefaultData(writePermission, { courseId });
		const { _id: id } = lesson;

		const patchedData = {
			title: 'WUSA 512',
		};
		const { status, data } = await service.sendRequestToThisService('patch', {
			id, userId, courseId, data: patchedData,
		});

		const { status: getStatus, data: getData } = await service.sendRequestToThisService('get', {
			id, userId, courseId,
		});

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data._id).to.equal(id.toString());
		expect(Object.keys(data)).to.have.lengthOf(1);

		expect(getStatus).to.equal(200);
		expect(getData).to.an('object');
		expect(getData._id).to.equal(id.toString());
		expect(getData.title).to.equal(patchedData.title); // patched
		expect(getData.courseId).to.equal(courseId); // not patched
		expect(getData.sections).to.have.lengthOf(0);
	});

	it('patch with read permission should not work', async () => {
		const readPermission = helper.createPermission({ users: [userId], read: true });
		const lesson = await service.createWithDefaultData(readPermission, { courseId });
		const { _id: id } = lesson;

		const patchedData = {
			position: 2,
		};
		const { status } = await service.sendRequestToThisService('patch', {
			id, userId, courseId, data: patchedData,
		});

		expect(status).to.equal(403);
	});

	it('update with permission should not work', async () => {
		const writePermission = helper.createPermission({ users: [userId], write: true });
		const lesson = await service.createWithDefaultData(writePermission, { courseId });

		const { status } = await service.sendRequestToThisService('update', {
			id: lesson._id, userId, courseId, data: lesson,
		});

		expect(status).to.equal(405);
	});
});
