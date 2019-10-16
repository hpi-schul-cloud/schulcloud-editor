const { expect } = require('chai');
const { connectDb, clearDb, closeDb } = require('.');
const { LessonModel } = require('../../services/lessons/models');
const { GroupModel } = require('../../services/groups/models');
const { createGroup, createLesson } = require('../fake-data');

describe.skip('db connection and clearing', () => {
	it('should connect to the db', async () => {
		await connectDb();
	});

	it('should clear the database', async () => {
		await createGroup();
		await createLesson();

		const grpBeforeCount = await GroupModel.countDocuments();
		const lessonBeforeCount = await LessonModel.countDocuments();
		expect(grpBeforeCount).to.be.greaterThan(0);
		expect(lessonBeforeCount).to.be.greaterThan(0);

		await clearDb();

		const grpCount = await GroupModel.countDocuments({});
		const lessonCount = await LessonModel.countDocuments({});
		expect(grpCount).to.equal(0);
		expect(lessonCount).to.equal(0);
	});

	it('should close the database connection and exit the test', async () => {
		await closeDb();
	});
});
