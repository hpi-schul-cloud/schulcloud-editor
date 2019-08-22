/* eslint-disable no-undef */
module.exports = {
	host: 'localhost',
	port: 4001,
	mongodb: 'mongodb://localhost:27017/schulcloud-editor',
	public: '../public/',
	routes: {
		course: {
			base: 'http://server:3030',
		},
	},
};
