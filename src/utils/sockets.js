const { requestInfo } = require('../logger');

let publishData;
let joinChannel;
if (['production', 'test'].includes(process.env)) {
	publishData = (app, prefix) => data => app.channel(`${prefix}/${data._id}`).send(data);
	joinChannel = (app, prefix, sufix) => connection => app.channel(`${prefix}/${sufix}`).join(connection);
} else {
	// logging for development
	publishData = (app, prefix) => (data) => {
		requestInfo({
			method: 'publishData',
			body: data,
			url: `${prefix}/${data._id}`,
		}, { userId: 'xxx', type: 'Socket' });

		app.channel(`${prefix}/${data._id}`).send(data);
	};
	joinChannel = (app, prefix, sufix) => (connection) => {
		requestInfo({
			method: 'joinChannel',
			url: `${prefix}/${sufix}`,
		}, { userId: 'xxx', type: 'Socket' });

		app.channel(`${prefix}/${sufix}`).join(connection)
	};
}
module.exports = {
	publishData,
	joinChannel,
};
