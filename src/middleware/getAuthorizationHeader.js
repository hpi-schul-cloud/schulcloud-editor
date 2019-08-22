module.exports = (req, res, next) => {
	req.feathers.authorization = req.headers.authorization;
	next();
};
