const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const favicon = require('serve-favicon');
const path = require('path');
// const bodyParser = require('body-parser');
// const logger = require('winston');

const hooks = require('./hooks/');
const database = require('./database/');
const services = require('./services/');
// const middleware = require('./middleware'); // todo test if it is need

// const defaultHeaders = require('./middleware/defaultHeaders'); @deprecated
const handleResponseType = require('./middleware/handleResponseType');

const conf = configuration();

const app = express(feathers())
	.configure(conf)
	.use(express.json())
	.use(express.urlencoded({ extended: true }))

	.configure(express.rest(handleResponseType)) // todo "handleResponseType" test it, maybe no effect see express.json()

	.use('/', express.static('public'))
	.use(favicon(path.join('public', 'favicon.ico')))

	// .use(defaultHeaders) // todo test it, position,  if we need it?

	.configure(database)
	// .configure(middleware)
	.use((req, res, next) => {
		req.feathers.headers = req.headers;
		next();
	})
	.configure(services)
	.hooks(hooks)
	.use(express.errorHandler({
		// force format html error to json
		html: (error, req, res, next) => {
			res.json(error);
		},
	}));
/*
app.on('unhandledRejection', (reason, p) => {
	logger.info('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});
*/

module.exports = app;
