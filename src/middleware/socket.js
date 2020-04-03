const socketio = require('@feathersjs/socketio');
const { socketJwtHandler, jwtHandler } = require('./handleJWTAndAddToContext');

module.exports = app => app.configure(
	socketio((io) => {
		io.on('connection', (socket) => {
		// do some authorization things
			app.channel('anonymous').join(socket.feathers);

			socket.on('authorization', (data) => {
				console.log("socket.on('authorization'", data);
				const { token } = data;
				jwtHandler(socket.feathers, token);
				app.channel('all').join(socket.feathers);
			});
		});

		// socketJwtHandler(io);

		io.use((socket, next) => {
			next();
		});
		app.set('io', io);
	}),
);
