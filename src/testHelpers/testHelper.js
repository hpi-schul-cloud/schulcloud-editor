/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
const axios = require('axios');
const queryString = require('query-string');

const { PermissionModel } = require('../services/permissionsHelper/models');

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
		this.Model = mongoose.model(this.modelName);

		this.warn = warn;
		this.info = info;

		// test if method is exist in service
		this.service = this.app.service(this.serviceName);

		const urlVars = this.serviceName.match(/(:\w+)/g);
		this.urlVars = (urlVars || []).map(v => v.substr(1));

		this.defaultData = defaultData[this.modelName] || {};
		if (!this.defaultData) {
			this.warn(`No default data for model in ./src/testHelpers/defaultData/${this.modelName}.js defined.`);
		}
		this.init(app);
	}

	init(app) {
		this.create = async (data, params) => {
			return this.service.create(data, params)
				.then((result) => {
					const id = this.extractId(data, this.ids.push);
					this.ids.push(id);
					return result;
				});
		};

		this.remove = (id, params) => {
			return this.service.remove(id, params)
				.then((result) => {
					this.info(` REMOVE ${id}>`);
					this.removeId(id);
					return result;
				});
		};
		this.jwt = jwtHelper(app);
	}

	getRequestMethod(method) {
		const overrideMethod = {
			create: 'post',
			remove: 'delete',
			find: 'get',
			update: 'put',
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
		if (['remove', 'delete', 'update', 'patch'].includes(method) && !id) {
			this.warn(`Method ${method} required to set a id. Please add it with settings.id.`);
		}
		// eslint-disable-next-line no-param-reassign
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
		if (query) {
			if (typeof query === 'string') {
				url += query;
			} else {
				url += queryString.stringify(query, { arrayFormat: 'bracket' });
			}
		}
		url += query;

		const requestParams = {
			method,
			url,
			timeout: 30000,
			baseURL: this.app.get('baseEditorUrl'),
			headers: {
				Authorization: this.jwt.create(userId),
			},
		};

		if (['put', 'patch', 'post'].includes(method)) {
			requestParams.data = sendData || {};
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

	async createWithDefaultData(overrideData = {}, permissions = [], permissionsKey = 'permissions') {
		const {
			Model, defaultData: baseData, extractId, warn,
		} = this;

		const inputData = Object.assign({}, baseData, overrideData);
		inputData[permissionsKey] = Array.isArray(permissions) ? permissions : [permissions];

		const $doc = new Model(inputData);
		await $doc.save((err) => {
			if (err) { warn(err); }
		});
		const doc = $doc.toObject({ getters: true });
		const id = extractId(doc);
		this.ids.push(id);
		return doc;
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
		const { ids, Model, info } = this;
		const $or = ids.map(_id => ({ _id }));

		if ($or.length > 0) {
			await Model.deleteMany({ $or });
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
		this.defaultPermissionData = defaultData.permission || {};
		this.init(app);
	}

	init(app) {
		this.warn = (messsage) => {
			// eslint-disable-next-line no-console
			console.warn(`TestHelper :${messsage}`);
		};

		this.info = (messsage) => {
			// eslint-disable-next-line no-console
			console.info(`TestHelper :${messsage}`);
		};

		app.serviceHelper = (serviceName) => {
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

	createPermission(overrideData = {}) {
		const inputData = Object.assign({}, this.defaultPermissionData, overrideData);
		if (!inputData.group && !Array.isArray(inputData.users)) {
			this.warn('Permission without users or group created.');
		}
		const $permission = new PermissionModel(inputData);
		return $permission.toObject({ getters: true });
	}

	createObjectId() {
		return mongoose.Types.ObjectId();
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
