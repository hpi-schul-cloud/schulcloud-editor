// @deprecated?
module.exports = (req, res) => {
	res.format({
		'application/json': () => {
			res.json(res.data);
		},
		'text/plain': () => {
			res.send(res.data);
		},
	});
};
