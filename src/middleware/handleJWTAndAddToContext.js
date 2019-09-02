const decode = require('jwt-decode');

const jwtHandler = (req, res, next) => {
	const regex = /Bearer (.+)/g;
	const jwt = (regex.exec(req.headers.authorization) || [])[1]; // todo length >= 2 test.

	if (jwt) {
		const { accountId, userId } = decode(jwt);
		req.feathers.accountId = accountId;
		req.feathers.userId = userId;
	}

	next();
};


module.exports = (app) => {
	app.logger.info('Set handler for jwt.');
	app.use(jwtHandler);
};
