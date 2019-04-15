// todo later
/*
this service can try with get to collect all informations for a userId
and try remove to delete all this information
it will throw an event and the services have added the operationens for it.
*/


const UserInformation = require('./services/infomation');

module.exports = function setup() {
	const app = this;

    app.use('userInformation', new UserInformation());
    const informationService = app.service('userInformation');
};
