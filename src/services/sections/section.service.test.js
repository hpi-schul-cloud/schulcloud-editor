const chai = require('chai');
// const chaiThings = require('chai-things');

const app = require('../../app');
const { TestHelper } = require('../../testHelpers');
const { KEY_NAME: userScopePermissionKey } = require('../../utils/setUserScopePermission');

const pathLesson = '/course/:courseId/lessons';
const pathSection = 'lesson/:lessonId/sections';
const pathSyncGroup = 'course​/:courseId​/lesson​/:lessonId/groups';

const { expect } = chai;
// chai.use(chaiThings);

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
			serviceName: pathSection,
			modelName: 'section',
		});
		sectionService = app.serviceHelper(pathSection);

		helper.registerServiceHelper({
			serviceName: pathLesson,
			modelName: 'lesson',
		});
		lessonService = app.serviceHelper(pathLesson);

		helper.registerServiceHelper({
			serviceName: pathSyncGroup,
			modelName: 'syncGroup',
		});
		syncGroupService = app.serviceHelper(pathSyncGroup);

		userId = helper.createObjectId().toString();
		courseId = helper.createObjectId().toString();

		writePermission = helper.createPermission({ users: [userId], write: true });
		readPermission = helper.createPermission({ users: [userId], read: true });
	});

	after(async () => {
		await syncGroupService.Model.remove();
		await helper.cleanup();
		await editor.close();
	});

	it('create with write permissions should work', async () => {
		await syncGroupService.Model.remove();
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
		expect(Object.keys(data)).to.have.lengthOf(2);
		expect(data._id.toString()).to.a('string');
		expect(data).to.not.have.property('permissions');
		expect(data).to.have.property(userScopePermissionKey);
	});

	it('create with read permissions should not work', async () => {
		await syncGroupService.Model.remove();
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

	it('create without permissions should not work', async () => {
		await syncGroupService.Model.remove();
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const syncGroup = await syncGroupService.createWithDefaultData({
			users: [userId], permission: 'write', lessonId, courseId,
		});

		// syncGroup with right permissions for this course exist
		expect(syncGroup).to.not.be.undefined;
		expect(syncGroup).to.not.be.null;
		expect(syncGroup.permission).to.equal('write');
		expect(syncGroup.courseId.toString()).to.equal(courseId.toString());

		const rndUserId = helper.createObjectId();
		const { status } = await sectionService.sendRequestToThisService('create', { userId: rndUserId, lessonId });

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

		const {
			status, data,
		} = await sectionService.sendRequestToThisService('get', { id: section._id, userId, lessonId });

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data.ref.target.toString()).to.equal(lessonId.toString());
		expect(data.state).to.deep.equal(state);
		expect(data).to.not.have.property('permissions');
		expect(data).to.have.property(userScopePermissionKey);
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

		const {
			status, data,
		} = await sectionService.sendRequestToThisService('get', { id: section._id, userId, lessonId });

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data.ref.target.toString()).to.equal(lessonId.toString());
		expect(data.state).to.deep.equal(state);
		expect(data).to.not.have.property('permissions');
		expect(data).to.have.property(userScopePermissionKey);
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
		expect(data).to.have.keys('total', 'limit', 'skip', 'data'); // paginated
		expect(data.data).to.have.lengthOf(2);
		expect(data.data[0]).to.not.have.property('permissions');
		expect(data.data[0].ref.target.toString()).to.equal(lessonId.toString());
		expect(data.data).all.have.property(userScopePermissionKey);
	});


	it('patch with write permissions should work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const state = { abc: 123, x: [] };
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ state, ref }, writePermission);

		expect(lessonId.toString()).to.equal(section.ref.target.toString());

		state.isPatched = true;
		const { status, data } = await sectionService.sendRequestToThisService('patch', {
			id: section._id, userId, lessonId, data: { state },
		});

		expect(status).to.equal(200);
		expect(data).to.an('object');
		expect(data._id.toString()).to.equal(section._id.toString());
		expect(Object.keys(data)).to.have.lengthOf(2);
		expect(data).to.have.property(userScopePermissionKey);

		const {
			status: getStatus, data: getData,
		} = await sectionService.sendRequestToThisService('get', { id: section._id, userId, lessonId });

		expect(getStatus).to.equal(200);
		expect(getData.state).to.deep.equal(state);
	});

	it('patch with read permissions should not work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, readPermission);
		const state = { abc: 123, x: [] };
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ state, ref }, readPermission);

		expect(lessonId.toString()).to.equal(section.ref.target.toString());

		state.isPatched = true;
		const { status } = await sectionService.sendRequestToThisService('patch', {
			id: section._id, userId, lessonId, data: { state },
		});

		expect(status).to.equal(403);
	});

	it('patch ref with write permissions should not work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ ref }, writePermission);

		expect(lessonId.toString()).to.equal(section.ref.target.toString());

		const refNew = {
			target: helper.createObjectId(),
			targetModel: 'lesson',
		};
		const { status } = await sectionService.sendRequestToThisService('patch', {
			id: section._id, userId, lessonId, data: { ref: refNew },
		});

		expect(status).to.equal(400);
	});

	it('update with permission should not work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ ref }, writePermission);

		const { status } = await sectionService.sendRequestToThisService('update', {
			id: section._id, userId, lessonId, data: section,
		});

		expect(status).to.equal(405);
	});

	describe('remove and deletedAt for any method', () => {
		let lessonId;
		let section;

		before(async () => {
			const { _id } = await lessonService.createWithDefaultData({ courseId }, writePermission);
			lessonId = _id.toString();
			const ref = {
				target: lessonId,
				targetModel: 'lesson',
			};
			section = await sectionService.createWithDefaultData({ ref }, writePermission);
		});

		it('remove with write permissions should work', async () => {
			const { status, data } = await sectionService.sendRequestToThisService('remove', {
				id: section._id, userId, lessonId,
			});

			const $modelData = await sectionService.Model.findOne({ _id: section._id });
			const modelData = $modelData.toObject();

			expect(status).to.equal(200);
			expect(data).to.an('object');
			expect(data._id.toString()).to.equal(section._id.toString());
			expect(data.deletedAt).to.not.be.undefined;
			expect(data).to.have.property(userScopePermissionKey);

			expect(modelData._id.toString()).to.equal(section._id.toString());
			expect(modelData.deletedAt).to.not.be.undefined;
		});

		it('find marked with deletedAt should nothing found', async () => {
			const { status: statusFind, data: dataFind } = await sectionService.sendRequestToThisService('find', {
				userId, lessonId,
			});
			expect(statusFind).to.equal(200);
			expect(dataFind.data).to.have.lengthOf(0);
		});

		it('find ressource marked with deletedAt should nothing found', async () => {
			const { status, data } = await sectionService.sendRequestToThisService('find', {
				userId, lessonId,
			});
			expect(status).to.equal(200);
			expect(data.data).to.have.lengthOf(0);
		});

		it('get ressource marked with deletedAt should nothing found', async () => {
			const { status } = await sectionService.sendRequestToThisService('get', {
				id: section._id, userId, lessonId,
			});
			expect(status).to.equal(404);
		});

		it('remove ressource marked with deletedAt should nothing found', async () => {
			const { status } = await sectionService.sendRequestToThisService('remove', {
				id: section._id, userId, lessonId,
			});
			expect(status).to.equal(404);
		});

		it('patch ressource marked with deletedAt should nothing found', async () => {
			const { status } = await sectionService.sendRequestToThisService('patch', {
				id: section._id, userId, lessonId,
			});
			expect(status).to.equal(404);
		});
	});

	it('remove with read permissions should not work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, readPermission);
		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ ref }, readPermission);

		const { status } = await sectionService.sendRequestToThisService('remove', {
			id: section._id, userId, lessonId,
		});

		expect(status).to.equal(403);
	});
});
