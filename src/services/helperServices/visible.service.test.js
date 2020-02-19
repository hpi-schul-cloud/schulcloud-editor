/* eslint-disable max-len */
const chai = require('chai');

const app = require('../../app');
const { TestHelper } = require('../../testHelpers');

const pathVisible = 'helpers/setVisibility';

const { expect } = chai;

describe.only('helperServices/visible.service.js', () => {
	let editor;
	let helper;
	let visibleService;

	before((done) => {
		editor = app.listen(app.get('port'), done);
	});

	before(() => {
		helper = new TestHelper(app);
		helper.defaultServiceSetup();

		helper.registerServiceHelper({
			serviceName: pathVisible,
		});
		visibleService = app.serviceHelper(pathVisible);
	});

	after(async () => {
		await helper.cleanup();
		await editor.close();
	});

	it('section patch without permission should not work', async () => {
		const { sectionId } = await helper.createTestData({ readIsActivated: false });

		const patchOptions = {
			id: sectionId,
			userId: helper.createObjectId(),
			data: { visible: true, type: 'section' },
		};

		const { status, data } = await visibleService.sendRequestToThisService('patch', patchOptions);
		expect(status, 'should return forbidden').to.equal(403);
		expect(data.message, 'should return the right error message from services').to.equal(visibleService.service.err.noAccess);
	});

	it('lesson patch without permission should not work', async () => {
		const { lessonId } = await helper.createTestData({ readIsActivated: false });

		const patchOptions = {
			id: lessonId,
			userId: helper.createObjectId(),
			data: { visible: true, type: 'lesson' },
		};

		const { status, data } = await visibleService.sendRequestToThisService('patch', patchOptions);
		expect(status, 'should return forbidden').to.equal(403);
		expect(data.message, 'should return the right error message from services').to.equal(visibleService.service.err.noAccess);
	});

	it('lesson patch with read permission should not work', async () => {
		const { lessonId, readUserId } = await helper.createTestData({ readIsActivated: false });

		const patchOptions = {
			id: lessonId,
			userId: readUserId,
			data: { visible: true, type: 'lesson' },
		};

		const { status, data } = await visibleService.sendRequestToThisService('patch', patchOptions);
		expect(status, 'should return forbidden').to.equal(403);
		expect(data.message, 'should return the right error message from services').to.equal(visibleService.service.err.noAccess);
	});

	it('section patch should work', async () => {
		const { section, writeUserId } = await helper.createTestData({ readIsActivated: false });

		const patchOptions = {
			id: section._id,
			userId: writeUserId,
			data: { visible: true, type: 'section' },
		};

		const {
			status: statusTrue, data: dataTrue,
		} = await visibleService.sendRequestToThisService('patch', patchOptions);

		expect(statusTrue).to.equal(200);
		expect(dataTrue.permissions, 'test if read and write permission are added').to.be.an('array').to.has.lengthOf(2);
		expect(dataTrue.permissions[0].activated, 'should activated now, default is false').to.be.true;
		expect(dataTrue.permissions[1].activated, 'should not modified, default is true').to.be.true;

		patchOptions.data.visible = false;

		const {
			status: statusFalse, data: dataFalse,
		} = await visibleService.sendRequestToThisService('patch', patchOptions);

		const readPerm = dataFalse.permissions.find(p => p.read === true);
		const writePerm = dataFalse.permissions.find(p => p.write === true);

		expect(statusFalse).to.equal(200);
		expect(dataFalse.permissions, 'test if read and write permission are added').to.be.an('array').to.has.lengthOf(2);
		expect(readPerm.activated, 'should set to false now').to.be.false;
		expect(writePerm.activated, 'should not modified, default is true').to.be.true;
	});

	it('lesson patch with childs should work', async () => {
		const { sectionId, lesson, writeUserId } = await helper.createTestData({ readIsActivated: false });
		// data.child default is true
		const patchOptions = {
			id: lesson._id,
			userId: writeUserId,
			data: { visible: true, type: 'lesson' },
		};

		const {
			status: statusTrue, data: dataTrue,
		} = await visibleService.sendRequestToThisService('patch', patchOptions);

		expect(statusTrue).to.equal(200);
		expect(dataTrue.permissions, 'test if read and write permission are added').to.be.an('array').to.has.lengthOf(2);
		expect(dataTrue.permissions[0].activated, 'should activated now, default is false').to.be.true;
		expect(dataTrue.permissions[1].activated, 'should not modified, default is true').to.be.true;
		expect(dataTrue.sections, 'test if section is added').to.be.an('array').to.has.lengthOf(1);

		const trueSection = dataTrue.sections[0];
		expect(trueSection._id.toString(), 'should be the right section').to.equal(sectionId);
		expect(trueSection.permissions, 'test if read and write permission are added').to.be.an('array').to.has.lengthOf(2);
		expect(trueSection.permissions[0].activated, 'should activated now, default is false').to.be.true;
		expect(trueSection.permissions[1].activated, 'should not modified, default is true').to.be.true;

		patchOptions.data.visible = false;

		const {
			status: statusFalse, data: dataFalse,
		} = await visibleService.sendRequestToThisService('patch', patchOptions);

		expect(statusFalse).to.equal(200);
		expect(dataFalse.permissions, 'test if read and write permission are added').to.be.an('array').to.has.lengthOf(2);
		expect(dataFalse.sections, 'test if section is added').to.be.an('array').to.has.lengthOf(1);

		const readPerm = dataFalse.permissions.find(p => p.read === true);
		const writePerm = dataFalse.permissions.find(p => p.write === true);

		expect(readPerm.activated, 'should activated now, default is false').to.be.false;
		expect(writePerm.activated, 'should not modified, default is true').to.be.true;


		const falseSection = dataFalse.sections[0];
		expect(falseSection.permissions, 'test if read and write permission are added').to.be.an('array').to.has.lengthOf(2);
		expect(falseSection._id.toString(), 'should be the right section').to.equal(sectionId);

		const readSectionPerm = falseSection.permissions.find(p => p.read === true);
		const writeSectionPerm = falseSection.permissions.find(p => p.write === true);

		expect(readSectionPerm.activated, 'should set to false now').to.be.false;
		expect(writeSectionPerm.activated, 'should not modified, default is true').to.be.true;
	});

	// user has only read permission

	// no read permission vorhanden

	// lesson permission nicht vorhanden + section schon

	// lesson permission vorhanden + section teilweise nicht
	let lessonId;
	let testWriteUserId;
	before(async () => {
		({ lessonId, writeUserId: testWriteUserId } = await helper.createTestData({ readIsActivated: false }));
	});

	it('update should not allowed', async () => {
		const patchOptions = {
			id: lessonId,
			userId: testWriteUserId,
		};
		const { status, data } = await visibleService.sendRequestToThisService('update', patchOptions);
		expect(status).to.equal(405);
		expect(data.className).to.equal('method-not-allowed');
	});

	it('create should not allowed', async () => {
		const patchOptions = {
			userId: testWriteUserId,
		};
		const { status, data } = await visibleService.sendRequestToThisService('create', patchOptions);
		expect(status).to.equal(405);
		expect(data.className).to.equal('method-not-allowed');
	});

	it('get should not allowed', async () => {
		const patchOptions = {
			id: lessonId,
			userId: testWriteUserId,
		};
		const { status, data } = await visibleService.sendRequestToThisService('get', patchOptions);
		expect(status).to.equal(405);
		expect(data.className).to.equal('method-not-allowed');
	});

	it('find should not allowed', async () => {
		const patchOptions = {
			userId: testWriteUserId,
		};
		const { status, data } = await visibleService.sendRequestToThisService('find', patchOptions);
		expect(status).to.equal(405);
		expect(data.className).to.equal('method-not-allowed');
	});

	it('remove should not allowed', async () => {
		const patchOptions = {
			userId: testWriteUserId,
		};
		const { status, data } = await visibleService.sendRequestToThisService('remove', patchOptions);
		expect(status).to.equal(405);
		expect(data.className).to.equal('method-not-allowed');
	});
});
