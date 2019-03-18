const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const favicon = require('serve-favicon');
const path = require('path');
// const bodyParser = require('body-parser');
const logger = require('./logger');

const hooks = require('./global/');
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
	// todo "handleResponseType" test it, maybe no effect see express.json()
	.configure(express.rest(handleResponseType))

	.use('/', express.static('public'))
	.use(favicon(path.join('public', 'favicon.ico')))

	// .use(defaultHeaders) // todo test it, position,  if we need it?

	.configure(database)
	// .configure(middleware)
	.use((req, res, next) => {
		req.feathers.headers = req.headers;
		logger.request(req);
		next();
	})
	.configure(services)
	.hooks(hooks)
	.use(express.errorHandler({
		// force format html error to json
		// eslint-disable-next-line no-unused-vars
		html: (error, req, res, next) => {
			res.json(error);
		},
	}));

app.logger = logger;
/*
app.on('unhandledRejection', (reason, p) => {
	logger.info('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});
*/

module.exports = app;
