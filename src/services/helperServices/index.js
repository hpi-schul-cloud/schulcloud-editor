const { VisibilityService, VisibilityServiceHooks } = require('./visible.service');

module.exports = (app) => {
	const scope = 'helpers/';

	const pathVisible = `${scope}setVisibility`;
	app.use(pathVisible, new VisibilityService());
	app.service(pathVisible).hooks(VisibilityServiceHooks);
};
