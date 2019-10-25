const publishData = (app, prefix) => data => app.channel(`${prefix}/${data._id}`).send(data);

const joinChannel = (app, prefix, sufix) => connection => app.channel(`${prefix}/${sufix}`).join(connection);

module.exports = {
	publishData,
	joinChannel,
};
