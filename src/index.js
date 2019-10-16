const os = require('os');

const app = require('./app');

const port = app.get('port');
const server = app.listen(port);

server.on('listening', () => {
	console.log(`Feathers REST API started at ${app.get('baseEditorUrl')}`);
	// console.log(os.hostname());
	// console.log(os.networkInterfaces());
	// console.log(server.address());
});
