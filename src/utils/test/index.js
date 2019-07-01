const mongoose = require('mongoose');

function connectDb() {
	return mongoose.connect(
		process.env.DB_URL || 'mongodb://localhost:27017/schulcloud-editor-test', {
			user: process.env.DB_USERNAME,
			pass: process.env.DB_PASSWORD,
			useNewUrlParser: true,
		},
	);
}

async function clearDb() {
	for (const coll of Object.keys(mongoose.connection.collections)) {
		try {
			await mongoose.connection.db.dropCollection(coll);
		} catch (err) {
			// no need to do anything, just in case the collection was empty from the beginning
		}
	}
}

function closeDb() {
	return mongoose.connection.close();
}

module.exports = {
	connectDb,
	clearDb,
	closeDb,
};
