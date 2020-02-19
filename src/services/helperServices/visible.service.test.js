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
	let userId;

	before((done) => {
		editor = app.listen(app.get('port'), done);
	});

	before(() => {
		helper = new TestHelper(app);
		({ userId } = helper.defaultServiceSetup());

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

	});

	it('lesson patch without permission should not work', async () => {

	});

	it('section patch should work', async () => {
		const { section } = await helper.createTestData({ readIsActivated: false });

		const patchOptions = {
			id: section._id,
			userId,
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
		const { sectionId, lesson } = await helper.createTestData({ readIsActivated: false });
		// data.child default is true
		const patchOptions = {
			id: lesson._id,
			userId,
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

		// patch.child default is true
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

	// test other methods

	// no read permission vorhanden

	// lesson permission nicht vorhanden + section schon

	// lesson permission vorhanden + section teilweise nicht
});
