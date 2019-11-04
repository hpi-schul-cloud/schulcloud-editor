const decode = require('jwt-decode');
const { Forbidden } = require('@feathersjs/errors');


const jwtHandler = (feathers, authorization) => {
	const regex = /Bearer (.+)/g;
	const jwt = (regex.exec(authorization) || [])[1]; // todo length >= 2 test.

	if (jwt) {
		const { accountId, userId } = decode(jwt);
		feathers.accountId = accountId;
		feathers.userId = userId;
		feathers.authorization = authorization;
	}
};

const socketJwtHandler = io => io.use((socket, next) => {
	jwtHandler(socket.feathers, socket.handshake.query.authorization);
	next();
});

const apiJwtHandler = app => app.use((req, res, next) => {
	jwtHandler(req.feathers, req.headers.authorization);
	next();
});

module.exports = {
	jwtHandler,
	apiJwtHandler,
	socketJwtHandler,
};
