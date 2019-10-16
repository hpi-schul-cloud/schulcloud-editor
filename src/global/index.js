/* eslint-disable no-param-reassign */
const { GeneralError, Forbidden } = require('@feathersjs/errors');
const { iff, isProvider } = require('feathers-hooks-common');
const { filterOutResults } = require('./hooks');

const addUserId = (context) => {
	if (context.params.force) {
		return context;
	}

	if (context.params.userId) {
		// todo validate mongoose id
		// todo add name ?
		context.params.user = {
			id: context.params.userId.toString(),
		};
		return context;
	}

	throw new Forbidden('Can not resolve user information.');
};

const addCreatedBy = (context) => {
	if (context.method === 'create' && context.data) { // && !context.data.createdBy
		context.data.createdBy = context.params.user.id;
	}
	return context;
};

const addUpadtedBy = (context) => {
	if (['patch', 'update'].includes(context.method) && context.data) { //  && !context.data.updatedBy
		context.data.updatedBy = context.params.user.id;
	}
	return context;
};


/**
 * For errors without error code create server error with code 500.
 * In production mode remove error stack and data.
 * @param {context} ctx
 */
const errorHandler = (ctx) => {
	if (ctx.error) {
		if (ctx.error.hook) {
			delete ctx.error.hook;
		}

		if (!ctx.error.code) {
			ctx.error = new GeneralError(ctx.error.message || 'server error', ctx.error.stack || '');
		}

		ctx.app.logger.error(ctx.error);

		if (process.env.NODE_ENV === 'production') {
			ctx.error.stack = null;
			ctx.error.data = undefined;
		}

		return ctx;
	}
	ctx.app.logger.warning('Error with no error key is throw. Error logic can not handle it.');

	throw new GeneralError('server error');
};

exports.before = {
	all: [addUserId],
	find: [],
	get: [],
	create: [addCreatedBy],
	update: [addUpadtedBy],
	patch: [addUpadtedBy],
	remove: [],
};

exports.after = {
	// todo select is better but need more stable implementations
	all: [iff(isProvider('external'),
		filterOutResults(['__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'])),
	],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};

exports.error = {
	all: [errorHandler],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};
