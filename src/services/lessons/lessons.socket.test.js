const chai = require('chai');
const socketClient = require('../../testHelpers/socketClient');
const app = require('../../app');
const { TestHelper, ServerMock } = require('../../testHelpers');

const { expect } = chai;

const pathLesson = '/course/:courseId/lessons';
let socketUrl;
//
const createConntectedClient = async (jwt) => {
	let client;
	await new Promise(((resolve, reject) => {
		client = socketClient(socketUrl, jwt, resolve);

		setTimeout(() => {
			reject(new Error('Client connection timed out!'));
		}, (Number(app.get('socketTimeout')) || 5000));
	}));
	return client;
};

describe('lessons/lessons.socket.js', () => {
	let editor;
	let server;
	let helper;
	let service;

	let writePermission;
	let teacherUserIds;
	let studentUserIds;
	let courseIds;

	before((done) => {
		editor = app.listen(app.get('port'), done);
		socketUrl = `ws://localhost:${app.get('socketport')}/`;
	});


	before(async () => {
		server = new ServerMock(app);
		await server.initialize(app);

		helper = new TestHelper(app);
		helper.defaultServiceSetup();
		helper.registerServiceHelper({
			serviceName: pathLesson,
			modelName: 'lesson',
		});
		service = app.serviceHelper(pathLesson);

		teacherUserIds = server.getUserIdsByRole('teacher');
		studentUserIds = server.getUserIdsByRole('student');
		const users = teacherUserIds.concat(studentUserIds);

		courseIds = server.getCourseIds();

		writePermission = helper.createPermission({ users, write: true });
	});

	after(async () => {
		await helper.cleanup();
		await editor.close();
		await server.close();
	});

	const getCourseArray = async (size) => {
		let data = [];

		if (courseIds.length >= size) {
			if (size > 1) {
				data = await getCourseArray(size - 1);
			}

			const courseId = courseIds[size - 1];

			const lesson = await service.createWithDefaultData({ courseId }, writePermission);
			const { _id: lessonId } = lesson;
			data.push({ courseId, lessonId });
		}
		return data;
	};

	const createClients = async (teacherSize, studentSize) => {
		let data = {
			teacher: [],
			student: [],
		};

		if (teacherUserIds.length >= teacherSize && studentUserIds.length >= studentSize) {
			if (teacherSize >= 1) {
				data = await createClients(teacherSize - 1, studentSize);

				const clientJwt = helper.getJwt(teacherUserIds[teacherSize - 1]);
				const client = await createConntectedClient(clientJwt);
				data.teacher.push(client);
			} else if (studentSize >= 1) {
				data = await createClients(teacherSize, studentSize - 1);

				const clientJwt = helper.getJwt(studentUserIds[studentSize - 1]);
				const client = await createConntectedClient(clientJwt);
				data.student.push(client);
			}
		}

		return data;
	};


	describe('connection', () => {
		it('all clients should connect to websockets', async () => {
			const client = await createClients(1, 1);

			expect(client.teacher[0].isConnected).to.be.true;
			expect(client.student[0].isConnected).to.be.true;

			client.teacher[0].close();
			client.student[0].close();
		});
	});

	describe('communication', () => {
		it('client should send and receive data', async () => {
			/*= =============  Client Setup  ============== */
			const client = await createClients(1, 1);
			/*= ========  End of Client Setup  =========== */
			const course = await getCourseArray(1);

			const patch = {
				title: 'F=MA',
			};

			await client.teacher[0].joinChannel(course[0].courseId, course[0].lessonId);
			await client.student[0].joinChannel(course[0].courseId, course[0].lessonId);

			await new Promise(((resolve, reject) => {
				client.student[0].on('course/:courseId/lessons patched', (data) => {
					expect(data).to.include(patch);
					resolve();
				});

				client.teacher[0].emit(
					'patch',
					`course/${course[0].courseId}/lessons`,
					course[0].lessonId,
					patch,
				);

				setTimeout(() => {
					reject(new Error('Client not receiving message in time! (>4000ms)'));
				}, 4000);
			}));

			patch.title = 'E=MC²';

			await new Promise(((resolve, reject) => {
				client.teacher[0].on('course/:courseId/lessons patched', (data) => {
					expect(data).to.include(patch);
					resolve();
				});

				client.student[0].emit(
					'patch',
					`course/${course[0].courseId}/lessons`,
					course[0].lessonId,
					patch,
				);

				setTimeout(() => {
					reject(new Error('Client not receiving message in time! (>4000ms)'));
				}, 4000);
			}));

			client.teacher[0].close();
			client.student[0].close();
		});

		it('client should send and receive data only in joined Channels', async () => {
			/*= =============  Client Setup  ============== */
			const client = await createClients(2, 2);
			/*= ========  End of Client Setup  =========== */
			const course = await getCourseArray(2);

			const patch1 = {
				title: 'F=MA',
			};
			const patch2 = {
				title: 'E=MC²',
			};

			await client.teacher[0].joinChannel(course[0].courseId, course[0].lessonId);
			await client.student[0].joinChannel(course[0].courseId, course[0].lessonId);
			await client.student[1].joinChannel(course[1].courseId, course[1].lessonId);
			await client.teacher[1].joinChannel(course[1].courseId, course[1].lessonId);


			await new Promise(((resolve) => {
				client.student[1].on('course/:courseId/lessons patched', (data) => {
					expect(data).to.not.include(patch1);
				});
				client.teacher[1].on('course/:courseId/lessons patched', (data) => {
					expect(data).to.not.include(patch1);
				});

				client.teacher[0].emit(
					'patch',
					`course/${course[0].courseId}/lessons`,
					course[0].lessonId,
					patch1,
				);

				setTimeout(() => {
					resolve();
				}, 2000);
			}));

			await new Promise(((resolve) => {
				client.student[0].on('course/:courseId/lessons patched', (data) => {
					expect(data).to.not.include(patch2);
				});
				client.teacher[0].on('course/:courseId/lessons patched', (data) => {
					expect(data).to.not.include(patch2);
				});

				client.teacher[1].emit(
					'patch',
					`course/${course[1].courseId}/lessons`,
					course[1].lessonId,
					patch2,
				);

				setTimeout(() => {
					resolve();
				}, 2000);
			}));

			client.teacher[0].close();
			client.teacher[1].close();
			client.student[0].close();
			client.student[1].close();
		});
	});
});
