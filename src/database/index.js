const mongoose = require('mongoose');

module.exports = (app) => {
	mongoose.connect(
		process.env.DB_URL || app.get('mongodb'), {
			user: process.env.DB_USERNAME,
			pass: process.env.DB_PASSWORD,
			useNewUrlParser: true,
		},
	);
	mongoose.Promise = global.Promise;
};
