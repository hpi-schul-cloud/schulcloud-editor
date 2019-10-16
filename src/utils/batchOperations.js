const removeKeyFromList = (list, key) => list.map((r) => {
	delete r[key];
	return r;
});

module.exports = {
	removeKeyFromList,
};
