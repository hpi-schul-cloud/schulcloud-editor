const paginate = (data, params) => ({
	total: data.length,
	limit: params.query.$limit || 1000,
	skip: params.query.$skip || 0,
	data,
});

const isNumber = v => typeof v === 'number';
const isPaginated = (obj = {}) => isNumber(obj.total)
								&& isNumber(obj.total)
								&& isNumber(obj.skip)
								&& Array.isArray(obj.data);

module.exports = {
	paginate,
	isPaginated,
};
