const sync = require('feathers-sync');

module.exports = (app) => {
	app.configure(sync({
		uri: 'redis://localhost:6379',
	}));
};
