/* eslint-disable no-console */
const cors = require('cors');
const path = require('path');
const feathers = require('@feathersjs/feathers');
// eslint-disable-next-line import/newline-after-import
const express = require('@feathersjs/express');
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', 'config');
process.env.NODE_ENV = process.env.NODE_ENV || 'default';
const configuration = require('@feathersjs/configuration');
const favicon = require('serve-favicon');

const hooks = require('./global/');
const database = require('./database/');
const services = require('./services/');
const middleware = require('./middleware');
const swagger = require('./swagger');
const handleResponseType = require('./middleware/handleResponseType');
const routes = require('./routes');

const conf = configuration();

console.log('\n___process.env___');
['NODE_CONFIG_DIR', 'NODE_ENV']
	.forEach(key => console.log(key, process.env[key]));
console.log('From config file:', conf());
console.log('\n');

const app = express(feathers())
	.configure(conf)
	.use(express.json())
	.use(express.urlencoded({ extended: true }))
	.use(cors())
	// todo "handleResponseType" test it, maybe no effect see express.json() @deprecated
	.configure(express.rest(handleResponseType))
	.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')))
	// .use(defaultHeaders) // todo test it, position,  if we need it? @deprecated
	.configure(swagger)
	.configure(database)
	.configure(middleware)
	.configure(routes)
	.configure(services)
	.hooks(hooks)
	.use(express.errorHandler({
		// force format html error to json
		// eslint-disable-next-line no-unused-vars
		html: (error, req, res, next) => {
			res.json(error);
		},
	}));


/*
app.on('unhandledRejection', (reason, p) => { @deprecated
	logger.info('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});
*/

module.exports = app;
