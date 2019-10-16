const { Types } = require('mongoose');
const { LessonModel } = require('../../../services/lessons/models');
const { SectionModel } = require('../../../services/sections/models');
const { GroupModel } = require('../../../services/groups/models');
const defaultSectionState = require('./section-state');

async function createGroup() {
	const grp = await new GroupModel({
		lesson: new Types.ObjectId(),
		owner: new Types.ObjectId(),
	}).save();

	return grp;
}

async function createLesson(group) {
	const grp = group || await createGroup();

	const lesson = await new LessonModel({
		title: 'first lesson',
		note: 'some notes',
		sections: [],
		owner: grp._id,
		type: 'lesson',
	}).save();

	return lesson;
}

async function createSection(lesson) {
	const ls = lesson || await createLesson();

	const section = await new SectionModel({
		lesson: ls._id,
		visible: true,
		note: 'some section notes',
		owner: ls.owner,
		title: 'Some section',
		state: defaultSectionState,
	}).save();

	return section;
}

module.exports = {
	createGroup,
	createLesson,
	createSection,
};
