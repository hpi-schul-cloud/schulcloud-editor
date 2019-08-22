const { template } = require('../src/global/helpers');

module.exports = {
	host: 'localhost',
	port: 4001,
	mongodb: 'mongodb://localhost:27017/schulcloud-editor',
	public: '../public/',
	routes: {
		course: {
			base: 'https://api.schul-cloud.org',
			permissions: template`/courses/${'courseId'}/userPermissions`,
		},
	},
};
