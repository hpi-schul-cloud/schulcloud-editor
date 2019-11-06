const socketio = require('@feathersjs/socketio');
const { socketJwtHandler, jwtHandler } = require('./handleJWTAndAddToContext');

module.exports = app => app.configure(
	socketio((io) => {
		// eslint-disable-next-line no-console
		console.log('Add socket connections');
		io.on('connection', (socket) => {
		// do some authorization things
			app.channel('anonymous').join(socket.feathers);

			socket.on('authorization', (data) => {
				const { token } = data;
				jwtHandler(socket.feathers, token);
				app.channel('all').join(socket.feathers);
			});
		});

		// socketJwtHandler(io);

		io.use((socket, next) => {
			next();
		});
	}),
);
