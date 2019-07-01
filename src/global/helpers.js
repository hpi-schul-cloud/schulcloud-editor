/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */

/* basic operations */
const { Forbidden, BadRequest } = require('@feathersjs/errors');
const mongoose = require('mongoose');

const isObject = e => typeof e === 'object';
const isString = e => typeof e === 'string';
const isSaveDefined = e => e && !null;
const isArray = e => Array.isArray(e);
const forceArray = (keys = []) => isArray(keys) ? keys : [keys];
const isArrayWithElement = e => isArray(e) && e.length > 0;

/* bson id operations */
const createId = () => mongoose.Types.ObjectId();
const bson = e => e.toString();
const sameId = (e1, e2) => bson(e1) === bson(e2);
const includeId = (array, e2) => array.some(e1 => sameId(e1, e2));
const pushId = (array, e) => { array.push(bson(e)); return array; };
const addIdIfNotExist = (array = [], e) => {
	array = forceArray(array);
	return !includeId(array, e) ? pushId(array, e) : array;
};

/* group operations */
const isGroup = e => isSaveDefined(e) && isObject(e) && e.type === 'group' && e.users;
const isInGroup = (group, user) => isGroup(group) && includeId(group.users, user);
const isMemberOf = (groups, user, err = false) => {
	const isMember = forceArray(groups).some(group => isInGroup(group, user));
	if (!isMember && err === true) {
		throw new Forbidden('You have no permission to access this.');
	}
	return isMember;
};

/* context operations */
const getSessionUser = (context) => {
	const { user } = context.params;
	if (!user) {
		throw new Forbidden('No authorization > user is defined.');
	}
	return user;
};

const createGroupsInData = (context, lesson, keys) => {
	if (!lesson || !keys) {
		throw new BadRequest('The LessonId or keys are required.');
	}

	const createGroup = (key) => {
		const users = forceArray(context.data[key]);
		return context.app.service('groups').create({ users, lesson }, context.params)
			.then((group) => {
				const { _id } = group;
				context.data[key] = _id;
				return _id;
			})
			.catch((err) => {
				throw new BadRequest(`Can not create group ${key} for a lesson.`, err);
			});
	};

	return Promise.all(forceArray(keys).map(k => createGroup(k))).then(() => context);
};

const isForced = context => context.params.force;

// models after helper
const addDocType = name => (docs, next) => {
	if (Array.isArray(docs)) {
		docs = docs.map((doc) => {
			doc.type = name;
			return doc;
		});
	} else {
		docs.type = name;
	}

	next();
};

const emptyHook = () => ({
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
});

module.exports = {
	isObject,
	isArray,
	isSaveDefined,
	forceArray,
	isGroup,
	isString,
	isInGroup,
	bson,
	sameId,
	includeId,
	pushId,
	addIdIfNotExist,
	isMemberOf,
	getSessionUser,
	createId,
	createGroupsInData,
	isForced,
	isArrayWithElement,
	emptyHook,
	addDocType,
};
