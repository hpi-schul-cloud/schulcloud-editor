/* eslint-disable no-confusing-arrow */
/* eslint-disable no-param-reassign */
const { Forbidden } = require('@feathersjs/errors');
const { block, populate } = require('../../../global/hooks');
const { isInGroup } = require('../../../global/collection');


const clearData = (context) => {
	console.log('todo clear data');
};

const recoverData = (context) => {
	console.log('todo recoverData');
};

const ForEachRestricted = (context) => {
	const { items } = context.result;
	const { user } = context.params;

	let bool = true;
	items.forEach((e) => {
		if (!(isInGroup(e, user) || isInGroup(e.owner, user) || isInGroup(e.users, user))) {
			bool = false;
		}
	});
	if (bool === false) {
		if (['patch', 'remove', 'update'].includes(context.method)) {
			recoverData(context);
		} else if (['create'].includes(context.method)) {
			clearData(context);
		}
		throw new Forbidden('You have not the access to see all the items in this collection.');
	}
	return context;
};


exports.before = {
	all: [populate('items')],
	find: [block],
	get: [],
	create: [],
	update: [block],
	patch: [],
	remove: [],
};

exports.after = {
	all: [ForEachRestricted],
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
