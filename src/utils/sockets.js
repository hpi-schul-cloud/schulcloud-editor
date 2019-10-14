const publishData = (app, prefix) => data => app.channel(`${prefix}/${data._id}`).send(data);

module.exports = {
	publishData,
};
