const chai = require('chai');

const app = require('../../app');
const { TestHelper } = require('../../testHelpers');
// const { KEY_NAME: userScopePermissionKey } = require('../../utils/setUserScopePermission');

const pathLesson = '/course/:courseId/lessons';
const pathSection = 'lesson/:lessonId/sections';
const pathVisible = 'helpers/setVisibility';

const { expect } = chai;

const getReadId = (doc) => {
	const { _id: readId } = doc.permissions.find(perm => perm.read === true);
	return readId.toString();
};

describe.only('helperServices/visible.service.js', () => {
	let editor;
	let helper;
	let sectionService;
	let lessonService;
	let visibleService;
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
			serviceName: pathVisible,
		});
		visibleService = app.serviceHelper(pathVisible);

		userId = helper.createObjectId().toString();
		courseId = helper.createObjectId().toString();

		writePermission = helper.createPermission({ users: [userId], write: true });
		readPermission = helper.createPermission({ users: [userId], read: true });
	});

	it('section patch without permission should not work', async () => {

	});

	it('lesson patch without permission should not work', async () => {

	});

	it('section patch should work', async () => {
		const { _id: lessonId } = await lessonService.createWithDefaultData({ courseId }, writePermission);

		const ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		const section = await sectionService.createWithDefaultData({ ref }, [writePermission, readPermission]);
		const readId = getReadId(section);

		const patchOptions = {
			id: section._id,
			userId,
			data: { visible: true, type: 'section' },
		};

		const {
			status: patchTrue, data: dataTrue,
		} = await visibleService.sendRequestToThisService('patch', patchOptions);

		expect(patchTrue).to.equal(200);
		expect(dataTrue.permissions).to.be.an('array').to.has.lengthOf(2);
		expect(dataTrue.permissions[0].activated).to.be.true;
		expect(dataTrue.permissions[1].activated).to.be.true;

		patchOptions.data.visible = false;

		const {
			status: patchFalse, data: dataFalse,
		} = await visibleService.sendRequestToThisService('patch', patchOptions);

		const readResponse = dataFalse.permissions.find(perm => perm._id.toString() === readId);
		const writeResponse = dataFalse.permissions.find(perm => perm._id.toString() !== readId);

		expect(patchFalse).to.equal(200);
		expect(dataFalse.permissions).to.be.an('array').to.has.lengthOf(2);
		expect(readResponse.activated).to.be.false;
		expect(writeResponse.activated).to.be.true;
	});

	it('lesson patch should work', async () => {

	});

	it('lesson patch with child sections should work', async () => {

	});

	// test other methods

	// no read permission vorhanden

	// lesson permission nicht vorhanden + section schon

	// lesson permission vorhanden + section teilweise nicht

	after(async () => {
		await helper.cleanup();
		await editor.close();
	});
});
