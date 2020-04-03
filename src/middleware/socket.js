const socketio = require('@feathersjs/socketio');
const { socketJwtHandler, jwtHandler } = require('./handleJWTAndAddToContext');

module.exports = (app) => app.configure(socketio(app.get('socketport'), (io) => {
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
		// Exposing a request property to services and hooks
		socket.feathers.referrer = socket.request.referrer;
		next();
	});
	app.set('io', io);
}));
