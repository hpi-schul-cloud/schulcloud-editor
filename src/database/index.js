const mongoose = require('mongoose');

module.exports = function setup() {
	const app = this;

	mongoose.connect(
		process.env.DB_URL || app.get('mongodb'), {
			user: process.env.DB_USERNAME,
			pass: process.env.DB_PASSWORD,
			useNewUrlParser: true,
		},
	);
	mongoose.Promise = global.Promise;
};
