const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const decode = require('jwt-decode');
const { BadRequest, Forbidden } = require('@feathersjs/errors');

const { systemInfo } = require('../logger');
const { server: serverDB } = require('./defaultData');
const { setupApplication, ServiceRoute } = require('../routes/ServiceRoutes');

const getRoutes = (app) => {
	// eslint-disable-next-line no-underscore-dangle
	let layers = app._router.stack;
	layers = layers.filter(l => l.route);
	return layers.map(l => l.route.path);
};

class ServerMock {
	constructor(app) {
		this.DB = serverDB;
	}

	async close() {
		return this.server.close();
	}

	async initialize(app) {
		this.app = express(feathers());
		this.port = (app.get('port') || 0) + 10;
		try {
			this.server = await this.app.listen(this.port);
		} catch (err) {
			systemInfo(err);
			return this.app;
		}

		// eslint-disable-next-line no-console
		systemInfo(`Mock-Server is started at port:${this.port}`);
		// todo configure which routes should override

		const testUri = '/test';
		const IDSuffix = '/:id';
		const protocol = app.get('protocol');
		const host = app.get('host');

		const baseURL = `${protocol}://${host}:${this.port}${testUri}`;
		const {
			server: {
				meUri,
				coursePermissionsUri,
				courseMembersUri,
			},
			timeout,
		} = app.get('routes');

		// is override existing route application
		app.configure(setupApplication);

		app.serviceRoute('server/me', new ServiceRoute({
			baseURL,
			uri: meUri,
			timeout,
			allowedMethods: ['get'],
		}));
		this.app.get(testUri + meUri + IDSuffix, this.me.bind(this));

		app.serviceRoute('server/courses/userPermissions', new ServiceRoute({
			baseURL,
			uri: coursePermissionsUri,
			timeout,
			allowedMethods: ['get'],
		}));
		this.app.get(testUri + coursePermissionsUri + IDSuffix, this.userPermissions.bind(this));

		app.serviceRoute('server/courses/members', new ServiceRoute({
			baseURL,
			uri: courseMembersUri,
			timeout,
			allowedMethods: ['find'],
		}));
		this.app.get(testUri + courseMembersUri, this.members.bind(this));

		// eslint-disable-next-line no-console
		systemInfo('Mock-Server routes:');
		systemInfo(getRoutes(this.app));
		return this.app;
	}

	me(req, res) {
		const currentUserId = this.validateJWT(req);
		const user = this.getUser(req.params.id);
		res.json(user);
	}

	userPermissions(req, res) {
		const currentUserId = this.validateJWT(req);
		// todo requested user === current user -> test permission
		if (!this.getCourseIds().includes(req.params.courseId)) {
			throw new Forbidden();
		}
		if (!req.params.id) {
			throw new BadRequest('Id not exist.');
		}

		try {
			const user = this.getUser(req.params.id);
			let permissions = [];

			user.roles.forEach((role) => {
				permissions = permissions.concat(role.permissions);
			});
			res.json(permissions);
		} catch (err) {
			throw new Forbidden(`User ${req.params.id} not found.`);
		}
	}

	members(req, res) {
		const currentUserId = this.validateJWT(req);
		const course = this.getCourseById(req.params.courseId);
		if (!course) {
			throw new Forbidden();
		}

		const responseData = {};
		try {
			const userIds = [...course.teachersIds, ...course.userIds, ...course.substitutionIds];
			userIds.forEach((userId) => {
				const { roles } = this.getUser(userId);
				responseData[userId] = roles[0].permissions; // todo
			});
			res.json(responseData);
		} catch (err) {
			throw new Forbidden(`User ${req.params.id} not found.`);
		}
	}

	copy(input) {
		if (Array.isArray(input)) {
			return input.slice();
		}
		if (typeof input === 'object') {
			return Object.assign({}, input);
		}
		return input;
	}

	getCopyOwn(list) {
		if (list.length !== 1) {
			throw new Forbidden(list);
		}
		return this.copy(list[0]);
	}

	getRole(roleId) {
		const roles = this.DB.roles.filter(role => role._id.toString() === roleId.toString());
		return this.getCopyOwn(roles);
	}

	getUser(userId) {
		const users = this.DB.users.filter(user => user._id.toString() === userId.toString());
		const user = this.getCopyOwn(users);
		user.roles = user.roles.map(roleId => this.getRole(roleId));
		return user;
	}

	getUserIdsByRole(roleName) {
		const teacher = this.DB.users.filter(
			user => this.getUser(user._id).roles.some(
				role => role.name === roleName,
			),
		);
		return teacher.map(user => user._id);
	}

	getCourseIds() {
		const courses = this.copy(this.DB.courses);
		return courses.map(course => course._id);
	}

	getCourseById(id) {
		return this.DB.courses.find(course => course._id.toString() === id.toString());
	}

	validateJWT(req) {
		const regex = /Bearer (.+)/g;
		const jwt = (regex.exec(req.headers.authorization) || [])[1];
		const { userId } = decode(jwt);
		if (this.DB.users.some(user => user._id.toString() === userId.toString())) {
			return userId;
		}
		throw new Forbidden('JWT validation failed.');
	}
}

module.exports = ServerMock;
