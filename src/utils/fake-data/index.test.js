const { expect } = require('chai');
const { connectDb, clearDb, closeDb } = require('../test');
const { LessonModel, GroupModel, SectionModel } = require('../../services/models');

const {
	createGroup,
	createLesson,
	createSection,
} = require('./');

describe('fake data', () => {
	before(async () => {
		await connectDb();
		await clearDb();
	});

	after(async () => {
		await clearDb();
		await closeDb();
	});

	it('should create a group', async () => {
		const grp = await createGroup();

		const dbGrp = await GroupModel.findById(grp._id);

		expect(dbGrp).to.exist;
	});

	it('should create a lesson', async () => {
		const ls = await createLesson();

		const dbLs = await LessonModel.findById(ls._id);

		expect(dbLs).to.exist;
	});

	it('should create a lesson with a given group', async () => {
		const grp = await createGroup();

		const ls = await createLesson(grp);

		expect(ls.owner.toString()).to.equal(grp._id.toString());
	});

	it('should create a lesson and a group when not passing arguments', async () => {
		const ls = await createLesson();

		const dbLs = await LessonModel.findById(ls._id);
		const dbGrp = await GroupModel.findById(ls.owner);

		expect(dbLs).to.exist;
		expect(dbGrp).to.exist;
	});

	it('should create a section', async () => {
		const sc = await createSection();

		const dbSc = await SectionModel.findById(sc._id);

		expect(dbSc).to.exist;
	});

	it('should create a section with a given lesson', async () => {
		const ls = await createLesson();
		const sc = await createSection(ls);

		expect(ls._id.toString()).to.equal(sc.lesson.toString());
	});

	it('should create a section and a lesson when not passing arguments', async () => {
		const sc = await createSection();
		const dbLs = await LessonModel.findById(sc.lesson);

		expect(dbLs._id.toString()).to.equal(sc.lesson.toString());
		expect(sc.owner.toString()).to.equal(dbLs.owner._id.toString());
	});
});
