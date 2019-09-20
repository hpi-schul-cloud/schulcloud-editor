const feathersSwagger = require('feathers-swagger');
const path = require('path');

module.exports = function setup(app) {
	app.configure(feathersSwagger({
		/* example configuration */
		docsPath: '/docs',
		version: '0.0.1',
		basePath: '/',
		host: '',
		uiIndex: path.join(__dirname, 'index.html'),
		schemes: ['http', 'https'],
		securityDefinitions: {
			bearer: {
				type: 'apiKey',
				name: 'Authorization',
				in: 'header',
			},
		},
		security: [
			{
				bearer: [],
			},
		],
		info: {
			title: 'Schul-Cloud Editor',
			description: 'This is the Schul-Cloud Editor.',
			termsOfServiceUrl: 'https://github.com/schul-cloud/schulcloud-editor/blob/master/LICENSE',
			contact: 'info@schul-cloud.org',
			license: 'GPL-3.0',
			licenseUrl: 'https://github.com/schul-cloud/schulcloud-editor/blob/master/LICENSE',
		},
	}));
};
