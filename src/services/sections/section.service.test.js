const chai = require('chai');
const app = require('../../app');
const { TestHelper } = require('../../testHelpers');

const { expect } = chai;

describe('sections/section.service.js', () => {
	let editor;
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

		userId = helper.createObjectId().toString();
		courseId = helper.createObjectId().toString();

		writePermission = helper.createPermission({ users: [userId], write: true });
		readPermission = helper.createPermission({ users: [userId], read: true });
	});

	after(async () => {
		await helper.cleanup();
		await editor.close();
	});

	it('create with write permissions should work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const syncGroup = await syncGroupService.createWithDefaultData({
			users: [userId], permission: 'write', lessonId, courseId,
		});

		// syncGroup with right permissions for this course exist
		expect(syncGroup).to.not.be.undefined;
		expect(syncGroup).to.not.be.null;
		expect(syncGroup.permission).to.equal('write');
		expect(syncGroup.courseId.toString()).to.equal(courseId.toString());

		const { status, data } = await sectionService.sendRequestToThisService('create', { userId, lessonId });

		// todo test if lesson sections is updated
		expect(status).to.equal(201);
		expect(data).to.an('object');
		expect(Object.keys(data)).to.have.lengthOf(1);
		expect(data._id.toString()).to.a('string');
		expect(data).to.not.have.property('permissions');
	});

	it('create with read permissions should not work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, readPermission);
		const syncGroup = await syncGroupService.createWithDefaultData({
			users: [userId], permission: 'read', lessonId, courseId,
		});

		// syncGroup with right permissions for this course exist
		expect(syncGroup).to.not.be.undefined;
		expect(syncGroup).to.not.be.null;
		expect(syncGroup.permission).to.equal('read');
		expect(syncGroup.courseId.toString()).to.equal(courseId.toString());

		const { status } = await sectionService.sendRequestToThisService('create', { userId, lessonId });

		expect(status).to.equal(403);
	});

	it('get with read permissions should work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, readPermission);
		const state = { abc: 123, x: [] };
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ state, ref }, readPermission);

		expect(lessonId.toString()).to.equal(section.ref.target.toString());

		const { status, data } = await sectionService.sendRequestToThisService('get', { id: section._id, userId, lessonId });

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data.ref.target.toString()).to.equal(lessonId.toString());
		expect(data.state).to.deep.equal(state);
		expect(data).to.not.have.property('permissions');
	});

	it('get with write permissions should work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const state = { abc: 123, x: [] };
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ state, ref }, writePermission);

		expect(lessonId.toString()).to.equal(section.ref.target.toString());

		const { status, data } = await sectionService.sendRequestToThisService('get', { id: section._id, userId, lessonId });

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data.ref.target.toString()).to.equal(lessonId.toString());
		expect(data.state).to.deep.equal(state);
		expect(data).to.not.have.property('permissions');
	});

	it('get without permissions should not work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const state = { abc: 123, x: [] };
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ state, ref });

		expect(lessonId.toString()).to.equal(section.ref.target.toString());

		const { status } = await sectionService.sendRequestToThisService('get', { id: section._id, userId, lessonId });

		expect(status).to.equal(403);
	});

	it('find with read permissions should work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		await Promise.all([
			sectionService.createWithDefaultData({ ref }, writePermission),
			sectionService.createWithDefaultData({ ref }, readPermission),
			sectionService.createWithDefaultData({ ref }),
		]);

		const { status, data } = await sectionService.sendRequestToThisService('find', { userId, lessonId });

		expect(status).to.equal(200);
		expect(data).to.have.all.keys('total', 'limit', 'skip', 'data'); // paginated
		expect(data.data).to.have.lengthOf(2);
		expect(data.data[0]).to.not.have.property('permissions');
		expect(data.data[0].ref.target.toString()).to.equal(lessonId.toString());
	});
});
