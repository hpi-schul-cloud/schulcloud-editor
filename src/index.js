/* eslint-disable no-console */
const app = require('./app');
const { systemInfo } = require('./logger');

const port = app.get('port');
const server = app.listen(port);

server.on('listening', () => {
	systemInfo('\n');
	systemInfo('*****************************************************************');
	systemInfo(`*	Feathers REST API started at ${app.get('baseEditorUrl')}	*`);
	systemInfo('*****************************************************************');
	systemInfo('\n');
	// systemInfo(os.hostname());
	// systemInfo(os.networkInterfaces());
	// systemInfo(server.address());
});
