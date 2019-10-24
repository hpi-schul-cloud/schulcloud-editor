const { sign } = require('jsonwebtoken');

const create = app => (userId = '') => {
	const jwt = sign({
		userId,
	}, app.get('testsecret'), { expiresIn: '1h' });
	return `Bearer ${jwt}`;
};

const createWrong = (userId = '') => {
	const jwt = sign({
		userId,
	}, 'WRONG_SECRET_IS_USED', { expiresIn: '1h' });
	return `Bearer ${jwt}`;
};

const validate = app => (jwt) => {
	// todo
};


module.exports = app => ({
	create: create(app),
	createWrong,
	validate: validate(app),
});
