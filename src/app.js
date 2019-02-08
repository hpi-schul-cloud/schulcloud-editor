const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');

const conf = configuration();

const app = express(feathers())
	.configure(conf);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.configure(express.rest());
app.use(express.errorHandler());

app.use('/', express.static('public'));
app.use(favicon(path.join('public', 'favicon.ico')));

module.exports = app;
// Start the server on port 3030
