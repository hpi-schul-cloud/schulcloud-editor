const decode = require('jwt-decode');
const { BadRequest } = require('@feathersjs/errors');

module.exports = (req, res, next) => {
	const regex = /Bearer (.+)/g;
	const jwt = (regex.exec(req.headers.authorization) || [])[1];

	if (!jwt) {
		throw new BadRequest('Missing JWT');
	}

	req.feathers.user = decode(jwt);

	next();
};
