const axios = require('axios');
const queryString = require('query-string');

class ServiceRoute {
	constructor({
		baseURL, uri, timeout = 4000, allowedMethods,
	}) {
		if (!baseURL || !uri) {
			throw new Error(`ServiceRoute missing params: ${JSON.stringify({ baseURL, uri })}`);
		}

		this.baseURL = baseURL;
		this.uri = uri;
		this.timeout = timeout;

		const urlVars = this.uri.match(/(:\w+)/g);
		this.urlVars = (urlVars || []).map(v => v.substr(1));

		this.serviceRoute = axios.create({
			baseURL,
			timeout,
		});

		this.wrap = {};
		this.buildWrapper(allowedMethods);
	}

	buildWrapper(allowedMethods) {
		if (!Array.isArray(allowedMethods)) {
			throw new Error('No allowedMethods are defined.');
		}

		if (allowedMethods.includes('get')) {
			this.wrap.get = (id, authorization, settings = {}) => this.clearResult(
				this.serviceRoute.get(
					this.getRealUrl(settings, id),
					settings.config || this.getDefaultConfig(authorization),
				),
			);
		}
		if (allowedMethods.includes('find')) {
			this.wrap.find = (authorization, settings = {}) => this.clearResult(
				this.serviceRoute.get(
					this.getRealUrl(settings),
					settings.config || this.getDefaultConfig(authorization),
				),
			);
		}
		if (allowedMethods.includes('create')) {
			this.wrap.create = (data, authorization, settings = {}) => this.clearResult(
				this.serviceRoute.post(
					this.getRealUrl(settings),
					data,
					settings.config || this.getDefaultConfig(authorization),
				),
			);
		}
		if (allowedMethods.includes('remove')) {
			this.wrap.remove = (id, authorization, settings = {}) => this.clearResult(
				this.serviceRoute.delete(
					this.getRealUrl(settings, id),
					settings.config || this.getDefaultConfig(authorization),
				),
			);
		}
		if (allowedMethods.includes('patch')) {
			this.wrap.patch = (id, data, authorization, settings = {}) => this.clearResult(
				this.serviceRoute.patch(
					this.getRealUrl(settings, id),
					data,
					settings.config || this.getDefaultConfig(authorization),
				),
			);
		}
	}

	getDefaultConfig(authorization) {
		return {
			headers: {
				Authorization: authorization,
			},
		};
	}

	clearResult(axiosPromise) {
		return axiosPromise.then(res => res.data)
			.catch((err) => {
				if (err.response) {
					return err.response.data;
				}
				return err;
			});
	}

	getRealUrl(settings, id) {
		let url = this.uri;
		this.urlVars.forEach((key) => {
			const value = settings[key];
			if (!value) {
				this.warn(`No settings for url value ${key} exist. Please add it into settings.`);
			}
			url = url.replace(`:${key}`, value);
		});
		if (id) {
			url += `/${id}`;
		}
		if (settings.query) {
			if (typeof settings.query === 'string') {
				url += settings.query;
			} else {
				url += queryString.stringify(settings.query, { arrayFormat: 'bracket' });
			}
		}
		return url;
	}

	getWrapper() {
		return this.wrap;
	}
}

class ServiceRouteApplication {
	constructor(app) {
		this.app = app;
		this.routes = {};
		this.path = 'serviceRoute';
	}

	initialize() {
		return (path, serviceRoute) => {
			// return services handler for execute
			if (!serviceRoute) {
				return this.routes[path].getWrapper();
			}
			// list all existing service routes;
			if (!path) {
				return this.routes;
			}
			// register new services
			if (!(serviceRoute instanceof ServiceRoute)) {
				throw new Error(
					'Register service route is failed. The serviceRoute is not instance of ServiceRoute',
				);
			}
			this.routes[path] = serviceRoute;
			// eslint-disable-next-line no-console
			console.log(`Register service route ${path}.`);
			return serviceRoute.getWrapper();
		};
	}
}

const setupApplication = (app) => {
	const application = new ServiceRouteApplication(app);
	app[application.path] = application.initialize();
};

module.exports = {
	ServiceRouteApplication,
	ServiceRoute,
	setupApplication,
};
