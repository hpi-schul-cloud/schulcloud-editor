const paginate = (data, params) => ({
	total: data.length,
	limit: params.query.$limit || 1000,
	skip: params.query.$skip || 0,
	data,
});

module.exports = {
	paginate,
};
