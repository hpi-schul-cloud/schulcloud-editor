const socketio = require('@feathersjs/socketio');
const { socketJwtHandler } = require('./handleJWTAndAddToContext');

module.exports = app => app.configure(socketio((io) => {
	io.on('connection', (socket) => {
		// do some authorization things
		const { id } = socket;

		socket.on('authentication', (data) => {
			const { jwt } = data;
			app.redis.set(socket.id, jwt);
			socket.feathers.token = jwt;
		});
	});

	socketJwtHandler(io);

	io.use((socket, next) => {
		const { request } = socket;
		const { redis } = app;
		next();
	});
}));
