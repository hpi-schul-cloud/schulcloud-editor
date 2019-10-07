const { server: serverDB } = require('./defaultData');

const overrideRoutes = () => {

};

class ServerMock {
	constructor(app) {
		this.app = app;
		this.DB = serverDB;
	}
}

module.exports = ServerMock;
