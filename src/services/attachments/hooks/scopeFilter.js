module.exports = (context) => {
	if (!context.params.query.$select) {
		context.params.query.$select = ['value', 'type', 'title', 'description'];
	}
	return context;
};
