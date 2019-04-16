// todo later
/*
this service can try with get to collect all informations for a userId
and try remove to delete all this information
it will throw an event and the services have added the operationens for it.
*/


const Information = require('./services/infomation');
const informationHooks = require('./hooks/information')

module.exports = function setup() {
	const app = this;

    app.use('user/information', new Information());
    const informationService = app.service('user/information');
    informationService.hooks(informationHooks);
};
