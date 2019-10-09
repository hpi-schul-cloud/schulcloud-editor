const decode = require('jwt-decode');
const { BadRequest, NotFound } = require('@feathersjs/errors');

const { server: serverDB } = require('./defaultData');
const { setupApplication, ServiceRoute } = require('../routes/ServiceRoutes')

class ServerMock {
	constructor() {
		this.DB = serverDB;

	//	this.init();
	}

	init(app) {
		// todo configure which routes should override
		this.overrideRoutes(app);
	}

	overrideRoutes(app) {
		const testUri = '/test';
		const IDSuffix = '/:id';
		const baseURL = `${app.get('fullhost')}${testUri}`;
		const { server: { meUri, coursePermissionsUri } } = app.get('routes');

		const timeout = 30000;
		// is override existing route application
		app.configure(setupApplication);
		app.serviceRoute('server/me', new ServiceRoute({
			baseURL,
			uri: meUri,
			timeout,
			allowedMethods: ['get'],
		}));

		app.get(testUri + meUri + IDSuffix, (req, res) => {
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

		app.get(testUri + coursePermissionsUri + IDSuffix, (req, res) => {
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

		return app;
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
		throw new BadRequest('JWT validation failed.');
	}
}

module.exports = ServerMock;
