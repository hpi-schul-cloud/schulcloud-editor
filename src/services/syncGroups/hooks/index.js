const { block, checkCoursePermission } = require('../../../global/hooks');
// @deprecated
// const mapUserIds = require('./mapUserIds');
const addCourseId = require('./addCourseId');
const readPermission = require('./readPermission');

exports.before = {
	all: [],
	find: [readPermission],
	get: [readPermission],
	create: [
		checkCoursePermission('COURSE_EDIT'),
		addCourseId,
		// mapUserIds,
	],
	update: [block],
	patch: [
		checkCoursePermission('COURSE_EDIT'),
		addCourseId,
		// mapUserIds,
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
