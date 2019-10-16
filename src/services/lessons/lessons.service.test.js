const chai = require('chai');
const app = require('../../app');
const { TestHelper, ServerMock } = require('../../testHelpers');

const { expect } = chai;
const pathLesson = '/course/:courseId/lessons';
const pathSyncGroup = 'course​/:courseId​/lesson​/:lessonId/groups';

describe('lessons/lessons.service.js', () => {
	let editor;
	let server;
	let helper;
	let service;
	let userId;
	let courseId;
	let readPermission;
	let writePermission;
	let syncGroupsService;

	before((done) => {
		editor = app.listen(app.get('port'), done);
	});

	before(async () => {
		server = new ServerMock(app);
		await server.initialize(app);

		helper = new TestHelper(app);
		helper.registerServiceHelper({
			serviceName: pathLesson,
			modelName: 'lesson',
		});

		helper.registerServiceHelper({
			serviceName: pathSyncGroup,
			modelName: 'syncGroup',
		});

		service = app.serviceHelper(pathLesson);
		syncGroupsService = app.serviceHelper(pathSyncGroup);

		const teacherIds = server.getUserIdsByRole('teacher');
		userId = teacherIds[0];

		const courseIds = server.getCourseIds();
		courseId = courseIds[0];

		writePermission = helper.createPermission({ users: [userId], write: true });
		readPermission = helper.createPermission({ users: [userId], read: true });
	});

	after(async () => {
		await server.close();
		await syncGroupsService.Model.remove();
		await helper.cleanup();
		await editor.close();
	});

	it('create should work', async () => {
		await syncGroupsService.Model.remove();
		const { status, data } = await service.sendRequestToThisService('create', { userId, courseId });

		// todo wait if member of is worked and is implemented, after it this test should not fail
		const { status: getStatus, data: getData } = await service.sendRequestToThisService('get', {
			id: data._id, userId, courseId,
		});

		const $syncGroups = await syncGroupsService.Model.find({ courseId });
		const syncGroups = $syncGroups.map(doc => doc.toObject());

		expect(status).to.equal(201);
		expect(data).to.an('object');
		expect(Object.keys(data)).to.have.lengthOf(1);
		expect(data._id).to.a('string');
		expect(data).to.not.have.property('permissions');

		// test if permissions created
		expect(getStatus).to.equal(200);
		expect(getData).to.an('object');
		expect(getData._id.toString()).to.equal(data._id.toString());

		// send from server mock
		expect(syncGroups).to.have.lengthOf(2);
		expect(syncGroups.some(s => s.permission === 'read')).to.be.true;
		expect(syncGroups.some(s => s.permission === 'write')).to.be.true;
	});

	it('create without permission should not work', async () => {
		await syncGroupsService.Model.remove();
		const rndUserId = helper.createObjectId();
		const { status } = await service.sendRequestToThisService('create', { userId: rndUserId, courseId });

		// todo pass Forbidden from server over this services?
		expect(status).to.equal(400);
	});

	it('create with read permission should not work', async () => {
		await syncGroupsService.Model.remove();
		const studentId = server.getUserIdsByRole('student')[0];
		const { status } = await service.sendRequestToThisService('create', { userId: studentId, courseId });

		expect(status).to.equal(403);
	});

	it('get with write permission should work', async () => {
		const lesson = await service.createWithDefaultData({ courseId }, writePermission);
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
		const lesson = await service.createWithDefaultData({ courseId }, writePermission);
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

		await Promise.all([
			service.createWithDefaultData({ courseId: randomCourseId }, writePermission),
			service.createWithDefaultData({ courseId: randomCourseId }, readPermission),
			service.createWithDefaultData({ courseId: randomCourseId }),
		]);

		const { status, data } = await service.sendRequestToThisService('find', { userId, courseId: randomCourseId });

		expect(status).to.equal(200);
		expect(data).to.have.all.keys('total', 'limit', 'skip', 'data'); // paginated
		expect(data.data).to.have.lengthOf(2);
		expect(data.data[0]).to.not.have.property('permissions');
	});

	// todo find sortierung and paginations

	it('patch with write permission should work', async () => {
		const lesson = await service.createWithDefaultData({ courseId }, writePermission);
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
		const lesson = await service.createWithDefaultData({ courseId }, readPermission);
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
		const lesson = await service.createWithDefaultData({ courseId }, writePermission);

		const { status } = await service.sendRequestToThisService('update', {
			id: lesson._id, userId, courseId, data: lesson,
		});

		expect(status).to.equal(405);
	});

	describe('remove and deletedAt for any method', async () => {
		let localCourseId;
		let lessonId;

		before(async () => {
			localCourseId = helper.createObjectId();
			const { _id } = await service.createWithDefaultData({ courseId: localCourseId }, writePermission);
			lessonId = _id;
		});

		it('remove with write permissions should work', async () => {
			const { status, data } = await service.sendRequestToThisService('remove', {
				id: lessonId, userId, courseId: localCourseId,
			});

			const $modelData = await service.Model.findOne({ _id: lessonId });
			const modelData = $modelData.toObject();

			expect(status).to.equal(200);
			expect(data).to.an('object');
			expect(data._id.toString()).to.equal(lessonId.toString());
			expect(data.deletedAt).to.not.be.undefined;

			expect(modelData._id.toString()).to.equal(lessonId.toString());
			expect(modelData.deletedAt).to.not.be.undefined;
		});

		it('find marked with deletedAt should nothing found', async () => {
			const { status, data } = await service.sendRequestToThisService('find', {
				userId, courseId: localCourseId,
			});
			expect(status).to.equal(200);
			expect(data.data).to.have.lengthOf(0);
		});

		it('get marked with deletedAt should nothing found', async () => {
			const { status } = await service.sendRequestToThisService('get', {
				id: lessonId, userId, courseId: localCourseId,
			});
			expect(status).to.equal(404);
		});

		it('patch marked with deletedAt should nothing found', async () => {
			const { status } = await service.sendRequestToThisService('patch', {
				id: lessonId, userId, courseId: localCourseId,
			});
			expect(status).to.equal(404);
		});

		it('remove marked with deletedAt should nothing found', async () => {
			const { status } = await service.sendRequestToThisService('remove', {
				id: lessonId, userId, courseId: localCourseId,
			});
			expect(status).to.equal(404);
		});
	});

	it('remove with read permissions should not work', async () => {
		const { _id: lessonId } = await service.createWithDefaultData({ courseId }, readPermission);

		const { status } = await service.sendRequestToThisService('remove', {
			id: lessonId, userId, courseId,
		});

		expect(status).to.equal(403);
	});
});
