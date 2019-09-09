/* eslint-disable no-param-reassign */
const { GeneralError, Forbidden } = require('@feathersjs/errors');
const logger = require('../logger');
const { filterOutResults } = require('./hooks');

const addUserId = (context) => {
	if (context.params.force) {
		context.params.user = '_isForce_';
		return context;
	}

	if (context.params.userId) {
		// todo validate mongoose id
		// todo add name ?
		context.params.user = context.params.userId.toString();
		return context;
	}

	throw new Forbidden('Can not resolve user information.');
};

const addcreatedFrom = (context) => {
	if (context.method === 'create' && context.data && !context.data.createdFrom) {
		context.data.createdFrom = context.params.user;
	}
	return context;
};

const addUpdateFrom = (context) => {
	if (context.method === 'create' && context.data && !context.data.updateFrom) {
		context.data.updateFrom = context.params.user;
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

		logger.error(ctx.error);

		if (process.env.NODE_ENV === 'production') {
			ctx.error.stack = null;
			ctx.error.data = undefined;
		}

		return ctx;
	}
	logger.warning('Error with no error key is throw. Error logic can not handle it.');

	throw new GeneralError('server error');
};

exports.before = {
	all: [addUserId],
	find: [],
	get: [],
	create: [addcreatedFrom],
	update: [addUpdateFrom],
	patch: [],
	remove: [],
};

exports.after = {
	all: [filterOutResults(['__v', 'createdAt', 'updatedAt', 'createdFrom', 'updatedFrom'])], // todo select is better but need more stable implementations
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
