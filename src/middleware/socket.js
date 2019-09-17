module.exports = (io) => {
	io.on('connection', (socket) => {
		// do some authorization things
		const { id } = socket;
	});

	io.use((socket, next) => {
		const {request} = socket;
		next();
	});
};

