const { block, checkCoursePermission } = require('../../../global/hooks');
const mapUserIds = require('./mapUserIds');
const addCourseId = require('./addCourseId');

exports.before = {
	all: [],
	find: [checkCoursePermission('LESSONS_VIEW')],
	get: [checkCoursePermission('LESSONS_VIEW')],
	create: [
		checkCoursePermission('COURSE_EDIT'),
		addCourseId,
		mapUserIds,
	],
	update: [block],
	patch: [
		checkCoursePermission('COURSE_EDIT'),
		addCourseId,
		mapUserIds,
	],
	remove: [
		checkCoursePermission('COURSE_EDIT'),
	],
};

exports.after = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};

exports.error = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};
