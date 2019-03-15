const { getPermissions, patchPermissions } = require('./permission');
const { subsection, removeSubSections } = require('./subsection');
const { getLesson, template, patchLesson } = require('./lesson');
const { rollbackSection } = require('./section');

module.exports = {
	getPermissions,
	patchPermissions,
	subsection,
	template,
	patchLesson,
	removeSubSections,
	getLesson,
	rollbackSection,
};
