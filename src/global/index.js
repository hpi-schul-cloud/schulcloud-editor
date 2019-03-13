/* eslint-disable no-param-reassign */
const { GeneralError, Forbidden } = require('@feathersjs/errors');
// const logger = require('winston');

const generalError = new GeneralError('server error');

const addUserId = (context) => {
	const userId = (context.params.headers || {}).authorization;
	if (userId) {
		// todo validate mongoose id
		context.params.user = userId.toString();
	} else {
		throw new Forbidden('Can not resolve user information.');
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
		console.log(ctx.error);

		if (!ctx.error.code) {
			ctx.error = new GeneralError('server error', ctx.error);
		}

		// logger.warn(ctx.error);

		if (process.env.NODE_ENV === 'production') {
			ctx.error.stack = null;
			ctx.error.data = undefined;
		}
		return ctx;
	}
	// logger.warn('Error with no error key is throw. Error logic can not handle it.');
	console.log('Error with no error key is throw. Error logic can not handle it.');
	throw new GeneralError('server error');
};

exports.before = {
	all: [addUserId],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
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
	all: [errorHandler],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};
