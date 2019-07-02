function isObject(o) {
	return typeof o === 'object' && !Array.isArray(o) && o !== null;
}

module.exports = { isObject };
