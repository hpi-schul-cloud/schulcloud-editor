const { GroupModel } = require('./groups/models');
const { SectionModel } = require('./sections/models');
const { LessonModel, StepModel } = require('./lessons/models');
const { CollectionModel } = require('./collections/models');

const getGroup = id => GroupModel.findById(id).lean().exec();
const getSection = id => SectionModel.findById(id).lean().exec();
const getLesson = id => LessonModel.findById(id).lean().exec();
const getCollection = id => CollectionModel.findById(id).lean().exec();

module.exports = {
	GroupModel,
	SectionModel,
	LessonModel,
	StepModel,
	CollectionModel,
	getGroup,
	getSection,
	getLesson,
	getCollection,
};
