const feathersSwagger = require('feathers-swagger');
const path = require('path');

module.exports = (app) => {
	app.configure(feathersSwagger({
		docsPath: '/',
		// version: '0.0.1',
		// versionPrefix: 'editor',
		basePath: '/',
		host: 'localhost:4001',
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
		specs: {
			info: {
				title: 'Schul-Cloud Editor',
				description: 'This is the Schul-Cloud Editor.',
				version: '0.0.1',
			//	termsOfServiceUrl: 'https://github.com/schul-cloud/schulcloud-editor/blob/master/LICENSE',
				contact: {
					name: 'support',
					email: 'info@schul-cloud.org',
				},
				license: {
					name: 'GPL-3.0',
					url: 'https://github.com/schul-cloud/schulcloud-editor/blob/master/LICENSE',
				},
			},
		},
	}));
};
