const decode = require('jwt-decode');

const jwtHandler = (feathers, authorization) => {
	const regex = /Bearer (.+)/g;
	const jwt = (regex.exec(authorization) || [])[1]; // todo length >= 2 test.
	console.log('jwtHandler>authorization', authorization);
	if (jwt) {
		const { accountId, userId } = decode(jwt);
		feathers.accountId = accountId;
		feathers.userId = userId;
		console.log('jwtHandler>userId', userId);
		feathers.authorization = authorization;
	}
};

const socketJwtHandler = io => io.use((socket, next) => {
	console.log('socketJwtHandler>socket.handshake.query', socket.handshake.query);
	jwtHandler(socket.feathers, socket.handshake.query.authorization);
	next();
});

const apiJwtHandler = app => app.use((req, res, next) => {
	console.log('jwtHandler>req.headers.authorization', req.headers);
	console.log('req.url', req.url);
	jwtHandler(req.feathers, req.headers.authorization);
	next();
});

module.exports = {
	jwtHandler,
	apiJwtHandler,
	socketJwtHandler,
};
