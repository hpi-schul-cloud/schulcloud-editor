const { isObject } = require('./helper');

function diffToMongo(diff, path = '') {
	diff = JSON.parse(JSON.stringify(diff));
	const setObj = {};
	const unsetObj = {};
	const pullObj = {};

	function buildPaths(diff, path) {
		const keys = Object.keys(diff);
		for (const key of keys) {
			const diffValue = diff[key];
			const prefix = path.length ? '.' : '';
			if (key === 'x-pull') {
				for (const pullIndex of diffValue) {
                    // e.g. diffValue would be ["1", "5"]
					setObj[`${path}.${pullIndex}`] = null;
				}

				pullObj[path] = null;
			} else if (
				isObject(diffValue)
                && diffValue.hasOwnProperty('x-new')
			) {
                // new objects
				delete diffValue['x-new'];
				setObj[`${path}${prefix}${key}`] = diffValue;
			} else if (Array.isArray(diffValue)) {
                // new array
				setObj[`${path}${prefix}${key}`] = diffValue;
			} else if (
				typeof diffValue === 'string'
                || typeof diffValue === 'boolean'
                || typeof diffValue === 'number'
			) {
                // normal value
				setObj[`${path}${prefix}${key}`] = diffValue;
			} else if (diffValue === null) {
                // null -> removed value
				unsetObj[`${path}${prefix}${key}`] = '';
			} else if (isObject(diffValue)) {
				buildPaths(diffValue, `${path}${prefix}${key}`);
			}
		}
	}

	buildPaths(diff, path);

	const mongoDiff = {};

	if (Object.keys(setObj).length) mongoDiff.$set = setObj;
	if (Object.keys(pullObj).length) mongoDiff.$pull = pullObj;
	if (Object.keys(unsetObj).length) mongoDiff.$unset = unsetObj;

	return mongoDiff;
}

module.exports = {
	diffToMongo,
};
