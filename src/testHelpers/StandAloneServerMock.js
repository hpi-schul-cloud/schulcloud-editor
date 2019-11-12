const app = require('../app');
const ServerMock = require('./ServerMock');

const server = new ServerMock(app);
server.initialize(app);
