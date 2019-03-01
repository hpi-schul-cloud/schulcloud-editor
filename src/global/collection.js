/* eslint-disable no-confusing-arrow */
/* basic operations */
const isObject = e => e !== undefined && typeof e === 'object';
const isString = e => typeof e === 'string';
const isArray = e => Array.isArray(e);

/* bson id operations */
const bson = e => e.toString();
const sameId = (e1, e2) => bson(e1) === bson(e2);
const includeId = (array, e2) => array.some(e1 => sameId(e1, e2));
const addIdIfNotExist = (array = [], e) => !includeId(array, e) ? array.push(bson(e)) : array;

/* high level operations */
const forceArray = (keys = []) => isArray(keys) ? keys : [keys];

const isGroup = e => !undefined && typeof e === 'object' && e.type === 'group' && e.users;
const isInGroup = (group, user) => isGroup(group) && includeId(group.users, user);

module.exports = {
	isObject,
	isArray,
	forceArray,
	isGroup,
	isString,
	isInGroup,
	bson,
	sameId,
	includeId,
	addIdIfNotExist,
};
