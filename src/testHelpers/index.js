/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
const defaultData = require('./defaultData');

class TestHelperService {
	constructor({
		app,
		serviceName,
		modelName,
		warning,
		info,
		additionalMethods,
	}) {
		this.app = app;
		this.ids = [];
		this.serviceName = serviceName;
		this.modelName = modelName;
		this.warning = warning;
		this.info = info;
		this.model = mongoose.model(this.modelName);

		// test if method is exist in service
		const service = this.app.service(this.serviceName);
		this.create = async (data, params) => {
			return service.create(data, params)
				.then((result) => {
					this.extractIdAndExecute(result, this.ids.push);
					return result;
				});
		};

		this.get = async (id, params) => {
			return service.get(id, params);
		};

		this.find = async (params) => {
			return service.find(params);
		};

		this.patch = async (id, data, params) => {
			return service.patch(id, data, params);
		};

		this.update = async (id, data, params) => {
			return service.update(id, data, params);
		};

		this.remove = (id, params) => {
			return service.remove(id, params)
				.then((result) => {
					this.removeId(id);
					return result;
				});
		};

		additionalMethods.forEach((method) => {
			if (this.method) {
				this.warning(
					`The method ${this.method} from serviceTestHelper ${this.serviceName},
					is override with additionalMethods option.`,
				);
			}
			this[method] = (...theArgs) => {
				service[method](theArgs);
			};
		});

		this.defaultData = defaultData[this.serviceName];
		if (!this.defaultData) {
			this.warning(`No default data for model in ./src/testHelpers/defaultData/${this.modelName}.js defined.`);
		}
	}

	async createDefault() {
		const instance = this.model(this.defaultData);
		const data = await instance.save((err) => {
			if (err) {
				this.warning(err);
			}
		});
		this.extractIdAndExecute(data, this.ids.push);
		return data;
	}

	pushId(id) {
		if (this.ids.includes(id)) {
			this.app.logger.warning('Id already added to store.');
		}
		this.ids.push(id);
	}

	extractIdAndExecute(result, executer) {
		const { _id } = result;
		if (!_id) {
			this.warning(
				`Execute create for serviceTestHelper ${this.serviceName}, do not create a result that includes _id.`,
			);
		} else if (executer) {
			executer(_id);
		}
		return _id;
	}

	removeId(id) {
		const index = this.ids.indexOf(id);
		if (index !== -1) {
			this.ids.splice(index, 1);
		} else {
			this.warning(
				`Remove id for serviceTestHelper ${this.serviceName}, do not find id=${id}.`,
			);
		}
	}

	async clear() {
		this.ids = [];
		return this.ids;
	}
}

class TestHelper {
	constructor({ app, logger }) {
		if (!app) {
			// eslint-disable-next-line no-console
			console.log('The app is not defined in TestHelper');
		}
		this.app = app;
		this.services = {};
		// eslint-disable-next-line no-console
		this.warning = logger.warning || logger.warn || this.app.logger.warning || console.warn;
		// eslint-disable-next-line no-console
		this.info = logger.info || this.app.logger.info || console.info;

		this.app.testService = (serviceName) => {
			return this.getServiceHelper(serviceName);
		};
	}


	registerServiceHelper({ serviceName, modelName, additionalMethods = [] }) {
		if (!this.services.serviceName) {
			this.warning('ServicesTestHelper is already registered');
		}
		if (mongoose.modelNames().includes(modelName)) {
			this.warning('Mongoose model do not exist.');
		}
		if (!this.app.service(serviceName)) {
			this.warning('Services do not exist in app.');
		}
		if (!Array.isArray(additionalMethods)) {
			this.warning('The param additionalMethods must be from type array.');
		}

		this.services[serviceName] = new TestHelperService({
			serviceName,
			app: this.app,
			warning: this.warning,
			info: this.info,
			modelName,
			additionalMethods,
		});
	}

	deleteServiceHelper(serviceName) {
		if (!this.services[serviceName]) {
			this.warning(`Service ${serviceName} do not exist.`);
			return false;
		}
		delete this.services[serviceName];
		return true;
	}

	getServiceHelper(serviceName) {
		if (!this.services[serviceName]) {
			this.warning(`Service ${serviceName} do not exist.`);
		}
		return this.services[serviceName];
	}

	clear() {
		const promises = [];
		Object.keys(this.services).forEach((serviceName) => {
			const promise = this.services(serviceName).clear();
			promises.push(promise);
		});
		return Promise.all(promises);
	}
}

module.exports = TestHelper;
