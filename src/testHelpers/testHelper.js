/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
const defaultData = require('./defaultData');

class TestHelperService {
	constructor({
		app,
		serviceName,
		modelName,
		warn,
		info,
		additionalMethods,
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
		this.create = async (data, params) => {
			return service.create(data, params)
				.then((result) => {
					this.extractIdAndExecute(result, this.ids.push);
					return result;
				});
		};

		this.get = async (id, params) => {
			this.info(` GET ${id}>`);
			return service.get(id, params);
		};

		this.find = async (params) => {
			this.info(' FIND>');
			return service.find(params);
		};

		this.patch = async (id, data, params) => {
			this.info(` PATCH ${id}>`);
			return service.patch(id, data, params);
		};

		this.update = async (id, data, params) => {
			this.info(` UPDATE ${id}>`);
			return service.update(id, data, params);
		};

		this.remove = (id, params) => {
			this.info(` REMOVE ${id}>`);
			return service.remove(id, params)
				.then((result) => {
					this.removeId(id);
					return result;
				});
		};

		additionalMethods.forEach((method) => {
			if (this.method) {
				this.warn(
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
			this.warn(`No default data for model in ./src/testHelpers/defaultData/${this.modelName}.js defined.`);
		}
	}

	async createDefault() {
		const instance = this.model(this.defaultData);
		const data = await instance.save((err) => {
			if (err) {
				this.warn(err);
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
			this.warn(
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
			this.warn(
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

		this.app.testService = (serviceName) => {
			return this.getServiceHelper(serviceName);
		};
	}


	registerServiceHelper({ serviceName, modelName, additionalMethods = [] }) {
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
		if (!Array.isArray(additionalMethods)) {
			warn('The param additionalMethods must be from type array.');
		}

		this.services[serviceName] = new TestHelperService({
			serviceName,
			app: this.app,
			warn,
			info,
			modelName,
			additionalMethods,
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
