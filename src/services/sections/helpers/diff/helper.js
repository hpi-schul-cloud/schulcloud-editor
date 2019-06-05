function arrayToObject(arr) {
	const o = {};

	for (const i in arr) {
		o[i] = arr[i];
	}

	return o;
}

function isArrayLike(obj) {
	return !Object.keys(obj).find((el, i) => isNaN(parseInt(el)));
}

function isObject(o) {
	return typeof o === 'object' && !Array.isArray(o) && o !== null;
}

function isArray(a) {
	return typeof a === 'object' && Array.isArray(a);
}

module.exports = {
	arrayToObject,
	isArrayLike,
	isObject,
	isArray,
};
