const sync = require('feathers-sync');

module.exports = (app) => {
	app.configure(sync({
		uri: app.get('redis'),
	}));
};
