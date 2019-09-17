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

const addCreatedBy = (context) => {
	if (context.method === 'create' && context.data) { // && !context.data.createdBy
		context.data.createdBy = context.params.user;
	}
	return context;
};

const addUpadtedBy = (context) => {
	if (['patch', 'update'].includes(context.method) && context.data) { //  && !context.data.updatedBy
		context.data.updatedBy = context.params.user;
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
	create: [addCreatedBy],
	update: [addUpadtedBy],
	patch: [addUpadtedBy],
	remove: [],
};

exports.after = {
	// todo select is better but need more stable implementations
	all: [filterOutResults(['__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'])],
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
