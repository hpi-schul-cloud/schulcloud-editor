/**
 * @method create
 * @param {*} context
 */
const setDefaultName = (context) => {
	const { title } = context.data;
	if (!title || title === '') {
		const date = new Date();

		let day = date.getDate();
		day = day < 10 ? `0${day}` : day;
		const month = date.getMonth() + 1;
		const year = date.getFullYear();

		context.data.title = `Neues Thema ${day}.${month}.${year}`;
	}
	return context;
};

module.exports = setDefaultName;
