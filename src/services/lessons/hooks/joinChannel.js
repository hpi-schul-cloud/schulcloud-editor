const joinChannel = prefix => (context) => {
	const { app, result, params } = context;

	if (params.provider !== 'socketio') { return context; }
	const all = app.channel(app.channels);
	const { connections } = app
		.channel(app.channels)
		.filter(connection =>
			connection.userId === params.user.id);

	connections.forEach(connection => app.channel(`${prefix}/${result._id}`).join(connection));

	return context;
};

module.exports = {
	joinChannel,
};
