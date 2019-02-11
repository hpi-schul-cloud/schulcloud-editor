const { GeneralError } = require('@feathersjs/errors');
const logger = require('winston');

/**
 * For errors without error code create server error with code 500.
 * In production mode remove error stack and data.
 * @param {context} ctx
 */
const errorHandler = (ctx) => {
	if (ctx.error) {
		if (!ctx.error.code) {
			ctx.error = new GeneralError('server error');
		}
		if (process.env.NODE_ENV === 'production') {
			logger.warn(ctx.error);
			ctx.error.stack = null;
			ctx.error.data = undefined;
		}
		return ctx;
	}
	logger.warn('Error with no error key is throw. Error logic can not handle it.');
	throw new GeneralError('server error');
};

exports.before = {
	all: [],
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
