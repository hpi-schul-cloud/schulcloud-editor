const axios = require('axios');
const queryString = require('query-string');

class ServiceRoute {
	constructor({
		baseURL, uri, timeout = 4000, allowedMethods,
	}) {
		this.baseURL = baseURL;
		this.uri = uri;
		this.timeout = timeout;

		const urlVars = this.uri.match(/(:\w+)/g);
		this.urlVars = (urlVars || []).map(v => v.substr(1));

		this.serviceRoute = this.init(baseURL, timeout);
		this.wrap = {};
		if (!Array.isArray(allowedMethods)) {
			throw new Error('No allowedMethods are defined.');
		}

		if (allowedMethods.includes('get')) {
			this.wrap.get = (id, authorization, settings) => this.clearResult(
				this.serviceRoute.get(
					this.getRealUrl(settings, id),
					this.getHeader(authorization),
				),
			);
		}
		if (allowedMethods.includes('find')) {
			this.wrap.find = (settings, authorization) => this.clearResult(
				this.serviceRoute.get(
					this.getRealUrl(settings),
					this.getHeader(authorization),
				),
			);
		}
		if (allowedMethods.includes('create')) {
			this.wrap.create = (data, authorization, settings) => this.clearResult(
				this.serviceRoute.post(
					this.getRealUrl(settings),
					data,
					this.getHeader(authorization),
				),
			);
		}
		if (allowedMethods.includes('remove')) {
			this.wrap.remove = (id, authorization, settings) => this.clearResult(
				this.serviceRoute.delete(
					this.getRealUrl(settings, id),
					this.getHeader(authorization),
				),
			);
		}
		if (allowedMethods.includes('patch')) {
			this.wrap.patch = (id, data, authorization, settings) => this.clearResult(
				this.serviceRoute.patch(
					this.getRealUrl(settings, id),
					data,
					this.getHeader(authorization),
				),
			);
		}
	}

	getHeader(authorization) {
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

	init(baseURL, timeout) {
		if (!baseURL) {
			throw new Error('No baseURL for service route is defined.');
		}
		return axios.create({
			baseURL,
			timeout,
		});
	}

	getExecuter() {
		return this.wrap;
	}
}

class ServiceRouteApplication {
	constructor(app) {
		this.app = app;
		this.routes = {};
		this.path = 'serviceRoute';
	}

	init() {
		return (path, serviceRoute) => {
			// return services handler for execute
			if (!serviceRoute) {
				return this.routes[path].getExecuter();
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
			this.app.logger.info(`Register service route ${path}.`);
			return serviceRoute.getExecuter();
		};
	}
}

const setupApplication = (app) => {
	const application = new ServiceRouteApplication(app);
	app[application.path] = application.init();
};

module.exports = {
	ServiceRouteApplication,
	ServiceRoute,
	setupApplication,
};
