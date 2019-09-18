const redis = require('redis');


module.exports = (app) => {
	const { port, host, database } = app.get('redis');

	const client = redis.createClient({
		port,
		host,
	});

	client.select(database);
	app.logger.info(`Connected to Redis ${host}:${port} at database ${database}`);

	app.redis = client;
};
