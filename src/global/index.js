/* eslint-disable no-param-reassign */
const { GeneralError, Forbidden } = require('@feathersjs/errors');
const { iff, isProvider } = require('feathers-hooks-common');
const { filterOutResults } = require('./hooks');

const addUserId = (context) => {
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
 * @param {context} context
 */
const errorHandler = (context) => {
	if (context.error) {
		// too much for logging...
		if (context.error.hook) {
			delete context.error.hook;
		}
		// statusCode is return by extern services / or mocks that use express res.status(myCodeNumber)
		context.error.code = context.error.code || context.error.statusCode;
		if (!context.error.code) {
			context.error = new GeneralError(context.error.message || 'server error', context.error.stack || '');
		}
		// in some cases is config set with secret informations like jwt
		if ((context.error.data || {}).config) {
			context.error.data.config = '<hide>';
		}

		return context;
	}
	context.app.logger.warning('Error with no error key is throw. Error logic can not handle it.');

	throw new GeneralError('server error');
};

const logResult = (context) => {
	context.app.logger.info(context.result);
	return context;
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

const after = {
	// todo select is better but need more stable implementations
	all: [iff(isProvider('external'),
		filterOutResults('__v', 'createdBy', 'updatedBy')),
	],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};
if (!['test', 'production'].includes(process.env.NODE_ENV)) {
	after.all.push(iff(isProvider('external'), logResult));
}
exports.after = after;

exports.error = {
	all: [errorHandler],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [],
};
