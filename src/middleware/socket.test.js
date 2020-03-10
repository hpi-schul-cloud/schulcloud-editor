const chai = require('chai');
const socketClient = require('../testHelpers/socketClient');
const app = require('../app');
const { TestHelper } = require('../testHelpers');

const { expect } = chai;

const pathLesson = '/course/:courseId/lessons';
const pathVisible = 'helpers/setVisibility';
const socketUrl = 'ws://localhost:5020/';

const createConntectedClient = async (jwt) => {
	let client;

	await new Promise(((resolve, reject) => {
		client = socketClient(socketUrl, jwt, resolve);
	}));

	return client;
};


describe('middleware/socket.js', () => {
	let editor;
	let helper;
	let visibleService;
	let service;

	before((done) => {
		editor = app.listen(5020, done);
	});


	before(() => {
		helper = new TestHelper(app);
		helper.defaultServiceSetup();

		helper.registerServiceHelper({
			serviceName: pathVisible,
		});
		helper.registerServiceHelper({
			serviceName: pathLesson,
			modelName: 'lesson',
		});
		visibleService = app.serviceHelper(pathVisible);
		service = app.serviceHelper(pathLesson);
	});

	after(async () => {
		await helper.cleanup();
		await editor.close();
	});
	describe('connection', () => {
		it('all clients should connect to websockets', async () => {
			const { readUserId, writeUserId } = await helper.createTestData({ readIsActivated: false });
			const client1Jwt = helper.getJwt(readUserId);
			const client2Jwt = helper.getJwt(writeUserId);

			const client1 = await createConntectedClient(client1Jwt);
			const client2 = await createConntectedClient(client2Jwt);

			expect(client1.isConnected).to.be.true;
			expect(client2.isConnected).to.be.true;

			client1.close();
			client2.close();
		});
	});

	describe('communication', () => {
		it('....', async () => {
			/*= =============  Client Setup  ============== */
			const { readUserId, writeUserId, section } = await helper.createTestData({ readIsActivated: false });
			const client1Jwt = helper.getJwt(readUserId);
			const client2Jwt = helper.getJwt(writeUserId);

			const client1 = await createConntectedClient(client1Jwt);
			const client2 = await createConntectedClient(client2Jwt);

			/*= ========  End of Client Setup  =========== */

			// const patchOptions = {
			// 	id: section._id,
			// 	userId: writeUserId,
			// 	data: { visible: true, type: 'section' },
			// };

			// const {
			// 	status: statusTrue, data: dataTrue,
			// } = await visibleService.sendRequestToThisService('patch', patchOptions);

			client1.close();
			client2.close();
		});
	});
});
