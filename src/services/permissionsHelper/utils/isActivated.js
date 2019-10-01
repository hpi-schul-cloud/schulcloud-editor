const isActivated = ({ endDate, publishDate, activated }) => {
	const date = Date.now();
	return activated === true
	&& (date < endDate || endDate === null)
	&& (date > publishDate || publishDate === null);
};

module.exports = isActivated;
