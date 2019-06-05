
const app = require('./app');

const port = app.get('port');
const host = app.get('host');

const server = app.listen(port);

server.on('listening', () => console.log(`Feathers REST API started at ${host}:${port}`));
