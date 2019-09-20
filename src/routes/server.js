const axios = require('axios');

module.exports = (app) => {
	const { server: { baseURL }, timeout } = app.get('routes');
	return axios.create({
		baseURL,
		timeout,
	});
};
