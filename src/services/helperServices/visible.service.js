const Ajv = require('ajv');
const { validateSchema } = require('feathers-hooks-common');
const { Forbidden, BadRequest } = require('@feathersjs/errors');

const { prepareParams, permissions: permissionsHelper } = require('../../utils');

/*
const {
	create: createSchema,
	patch: patchSchema,
} = require('./schemas'); */

const VisibilityServiceHooks = {
	before: {
		patch: [
			// validateSchema(patchSchema, Ajv),
		],
	},
};

class VisibilityService {
	constructor({ docs = {} } = {}) {
		this.docs = docs;

		this.serviceType = {
			lesson: '/models/LessonModel',
			section: '/models/SectionModel',
		};
		this.permissionKey = 'permissions';

		this.err = {
			noAccess: 'You have no access.',
		};
	}

	async request(services, ressourceId, params, visible, permissions = true) {
		const pK = this.permissionKey;
		const internParams = prepareParams(params, {
			$select: [pK, 'sections'],
			$populate: [
				{ path: 'permissions.group', select: 'users' },
			],
		});

		const overview = await this.app.service(services)
			.get(ressourceId, internParams);

		if (permissions && !permissionsHelper.hasWrite(overview[pK], params.user)) {
			throw new Forbidden(this.err.noAccess);
		}

		const readPermissions = overview[pK].filter(perm => perm.read === true)
		let patched = {};

		if (readPermissions.length > 0) {
			const patchParams = prepareParams(params, {
				$select: [pK, `${pK}._id`, `${pK}.activated`],
				[pK]: { $elemMatch: { read: true } },
			});

			const patchOperator = { $set: { [`${pK}.$.activated`]: visible } };
			patched = await this.app.service(services).patch(ressourceId, patchOperator, patchParams);
		}

		return {
			patched,
			overview,
		};
	}

	batchRequest(ids, params, visible) {
		return Promise.all(ids.map(id => this.request(this.serviceType.section, id, params, visible, false)));
	}

	/**
	 * Is type lesson only the permission of the lesson is check and modified child sections.
	 * @param {ObjectId} ressourceId - Map to type section, or lesson
	 * @param {data} [childs, visible, type] - Is type lesson, child can set true/false to update child sections too
	 */
	async patch(ressourceId, { childs = true, visible = true, type = 'lesson' }, params) {
		const { patched, overview } = await this.request(this.serviceType[type], ressourceId, params, visible);

		if (childs && overview.sections) {
			const patchedSections = await this.batchRequest(overview.sections, visible, params);
			patched.sections = patchedSections.map(res => res.patched);
		}

		return patched;
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	VisibilityService,
	VisibilityServiceHooks,
};
