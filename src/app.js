/* eslint-disable no-console */
const cors = require('cors');
const path = require('path');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', 'config');
process.env.NODE_ENV = process.env.NODE_ENV || 'default';
const configuration = require('@feathersjs/configuration');

const hooks = require('./global/');
const database = require('./database/');
const services = require('./services/');
const middleware = require('./middleware');
const swagger = require('./swagger');
const handleResponseType = require('./middleware/handleResponseType');
const routes = require('./routes');
const { systemInfo } = require('./logger');

systemInfo('\n******************** process.env *********************\n');
['NODE_CONFIG_DIR', 'NODE_ENV']
	.forEach(key => systemInfo(key, process.env[key]));
systemInfo('From config file:');
systemInfo(configuration()());
systemInfo('\n');

const app = express(feathers())
	.configure(configuration())
	.use(express.json())
	.use(express.urlencoded({ extended: true }))
	.use(cors())
	.configure(express.rest(handleResponseType))
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

module.exports = app;
