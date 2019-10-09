/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
const axios = require('axios');

const defaultData = require('./defaultData');
const jwtHelper = require('./jwtHelper');
// const RequestHelper = require('./requestHelper');

class TestHelperService {
	constructor({
		app,
		serviceName,
		modelName,
		warn,
		info,
	}) {
		this.app = app;
		this.ids = [];
		this.serviceName = serviceName;
		this.modelName = modelName;
		this.model = mongoose.model(this.modelName);

		this.warn = warn;
		this.info = info;

		// test if method is exist in service
		const service = this.app.service(this.serviceName);
		// eslint-disable-next-line no-underscore-dangle
		/* const afterHooks = service.__hooks.after || {};
		(afterHooks.remove || []).push(((context) => {
			this.removeId(context.id);
			return context;
		}));

		(afterHooks.create || []).push(((context) => {
			this.extractIdAndExecute(context.result, this.ids.push);
			return context;
		}));
		*/
		this.create = async (data, params) => {
			return service.create(data, params)
				.then((result) => {
					const id = this.extractId(data, this.ids.push);
					this.ids.push(id);
					return result;
				});
		};

		this.remove = (id, params) => {		
			return service.remove(id, params)
				.then((result) => {
					this.info(` REMOVE ${id}>`);
					this.removeId(id);
					return result;
				});
		};

		this.jwt = jwtHelper(app);

		const urlVars = this.serviceName.match(/(:\w+)/g);
		this.urlVars = urlVars.map(v => v.substr(1));

		// ref every key ..todo only functions ? how to test if base function has return value?
		/*
		Object.entries(service).forEach(([keyOrMethod, executerOrValue]) => {
			if (!this[keyOrMethod] && typeof executerOrValue === 'function') {
				this[keyOrMethod] = (...theArgs) => service[keyOrMethod](theArgs);
			}
		});
		*/
		this.defaultData = defaultData[this.modelName] || {};
		if (!this.defaultData) {
			this.warn(`No default data for model in ./src/testHelpers/defaultData/${this.modelName}.js defined.`);
		}
	}

	getRequestMethod(method) {
		const overrideMethod = {
			create: 'post',
			remove: 'delete',
		};
		return overrideMethod[method] || method;
	}

	/**
	 * @param {String} method
	 * @param {Object} settings
	 */
	async sendRequestToThisService(method, settings) {
		const {
			id, userId, query = '', data: sendData,
		} = settings;
		method = this.getRequestMethod(method);

		let url = this.serviceName;
		this.urlVars.forEach((key) => {
			const value = settings[key];
			if (!value) {
				this.warn(`No settings for url value ${key} exist. Please add it into settings.`);
			}
			url = url.replace(`:${key}`, value);
		});

		if (id) { url += `/${id}`; }
		if (typeof query === 'object') {
			// todo convert to query
		}
		url += query;

		const requestParams = {
			method,
			url,
			timeout: 30000,
			baseURL: this.app.get('fullhost'),
			headers: {
				Authorization: this.jwt.create(userId),
			},
		};

		if (sendData) {
			requestParams.data = sendData;
		}

		return axios(requestParams)
			.then((res) => {
				const { data } = res;

				if (method === 'post') {
					const _id = this.extractId(data);
					this.ids.push(_id);
				} else if (method === 'delete') {
					this.removeId(data._id);
				}

				return { status: res.status, data };
			})
			.catch((err) => {
				if (err.response) {
					return { status: err.response.status, data: err.response.data };
				}
				return err;
			});
	}

	async createDefault() {
		const instance = this.model(this.defaultData);
		const data = await instance.save((err) => {
			if (err) {
				this.warn(err);
			}
		});
		const id = this.extractId(data, this.ids.push);
		this.ids.push(id);
		return data;
	}

	pushId(id) {
		if (this.ids.includes(id)) {
			this.app.logger.warning('Id already added to store.');
		}
		this.ids.push(id);
	}

	extractId(result = {}) {
		const { _id } = result;
		if (!_id) {
			this.warn(
				`Execute create for serviceTestHelper ${this.serviceName}, do not create a result that includes _id.`,
			);
		}
		return _id;
	}

	removeId(id) {
		const index = this.ids.indexOf(id);
		if (index !== -1) {
			this.ids.splice(index, 1);
		} else {
			this.warn(
				`Remove id for serviceTestHelper ${this.serviceName}, do not find id=${id}.`,
			);
		}
	}

	async cleanup() {
		const { ids, model, info } = this;
		const $or = ids.map(_id => ({ _id }));

		if ($or.length > 0) {
			await model.deleteMany({ $or });
		}

		info(`Cleanup: ${ids.join(',')}`);
		this.ids = [];
		return ids;
	}
}

class TestHelper {
	constructor(app) {
		if (!app) {
			throw new Error('The app is not defined in TestHelper');
		}
		this.app = app;
		this.services = {};

		this.warn = (messsage) => {
			// eslint-disable-next-line no-console
			console.warn(`TestHelper :${messsage}`);
		};

		this.info = (messsage) => {
			// eslint-disable-next-line no-console
			console.info(`TestHelper :${messsage}`);
		};

		this.app.serviceHelper = (serviceName) => {
			return this.getServiceHelper(serviceName);
		};
	}


	registerServiceHelper({ serviceName, modelName }) {
		const warn = (messsage) => {
			this.warn(`${serviceName} ${messsage}`);
		};
		const info = (messsage) => {
			this.info(`${serviceName} ${messsage}`);
		};

		if (this.services.serviceName) {
			warn('Service is already registered');
		}
		if (!mongoose.modelNames().includes(modelName)) {
			warn('Mongoose model do not exist.');
		}
		if (!this.app.service(serviceName)) {
			warn('Services do not exist in app.');
		}

		this.services[serviceName] = new TestHelperService({
			serviceName,
			app: this.app,
			warn,
			info,
			modelName,
		});
	}

	deleteServiceHelper(serviceName) {
		if (this.services[serviceName]) {
			this.warn(`Service ${serviceName} do not exist.`);
			return false;
		}
		delete this.services[serviceName];
		return true;
	}

	getServiceHelper(serviceName) {
		if (!this.services[serviceName]) {
			this.warn(`Service ${serviceName} do not exist.`);
		}
		return this.services[serviceName];
	}

	async cleanup() {
		const { services } = this;
		const promises = Object.keys(services).map(
			serviceName => services[serviceName].cleanup(),
		);
		return Promise.all(promises);
	}
}

module.exports = TestHelper;
