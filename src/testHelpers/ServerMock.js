const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const decode = require('jwt-decode');
const { BadRequest, NotFound, Forbidden } = require('@feathersjs/errors');

const { server: serverDB } = require('./defaultData');
const { setupApplication, ServiceRoute } = require('../routes/ServiceRoutes');

class ServerMock {
	constructor(app) {
		this.DB = serverDB;
	}

	async close() {
		return this.server.close();
	}

	async initialize(app) {
		this.app = express(feathers());
		this.port = (app.get('port') || 0) + 1;
		this.server = await this.app.listen(this.port);
		app.logger.info(`Mock-Server is started at port:${this.port}`);
		// todo configure which routes should override

		const testUri = '/test';
		const IDSuffix = '/:id';
		const protocol = app.get('protocol');
		const host = app.get('host');
		const port = app.get('port');
		const baseURL = `${protocol}://${host}:${this.port}${testUri}`;
		const { server: { meUri, coursePermissionsUri } } = app.get('routes');

		const timeout = 3000;
		// is override existing route application
		app.configure(setupApplication);
		app.serviceRoute('server/me', new ServiceRoute({
			baseURL,
			uri: meUri,
			timeout,
			allowedMethods: ['get'],
		}));

		this.app.get(testUri + meUri + IDSuffix, (req, res) => {
			const currentUserId = this.validateJWT(req);
			const user = this.getUser(req.params.id);
			res.json(user);
		});

		app.serviceRoute('server/courses/userPermissions', new ServiceRoute({
			baseURL,
			uri: coursePermissionsUri,
			timeout,
			allowedMethods: ['get'],
		}));

		this.app.get(testUri + coursePermissionsUri + IDSuffix, (req, res) => {
			const currentUserId = this.validateJWT(req);
			// todo requested user === current user -> test permission
			if (!this.getCourseIds().includes(req.params.courseId)) {
				throw new NotFound();
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
				throw new NotFound(`User ${req.params.id} not found.`);
			}
		});

		return this.app;
	}

	copy(obj) {
		return Object.assign({}, obj);
	}

	getCopyOwn(list) {
		if (list.length !== 1) {
			throw new NotFound(list);
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
		return this.DB.courses.map(course => course._id);
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
