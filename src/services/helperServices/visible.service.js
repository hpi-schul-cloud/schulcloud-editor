const Ajv = require('ajv');
const { validateSchema } = require('feathers-hooks-common');
const { Forbidden } = require('@feathersjs/errors');

const {
	prepareParams,
	permissions: permissionsHelper,
	setUserScopePermission,
	convertTo,
} = require('../../utils');

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

		let patched = {};
		if (permissionsHelper.couldAnyoneOnlyRead(overview[pK])) {
			const patchParams = prepareParams(params, {
				// $select: `pK ${pK}._id ${pK}.activated ${pK}.read ${pK}.write`,
				$select: [pK], // , `${pK}._id`, `${pK}.activated`, `${pK}.read`, `${pK}.write`],
				[pK]: { $elemMatch: { read: true } },
			});

			const patchOperator = { $set: { [`${pK}.$.activated`]: visible } };
			patched = await this.app.service(services).patch(ressourceId, patchOperator, patchParams);
			patched = setUserScopePermission(patched, patched[pK], params.user);
			delete patched[pK];
		}
		return {
			patched,
			overview,
		};
	}

	batchRequest(ids, params, visible) {
		return Promise.all(ids.map((id) => this.request(this.serviceType.section, id, params, visible, false)));
	}

	/**
	 * Is type lesson only the permission of the lesson is check and modified child sections.
	 * TODO: performance increase to patch child sections from lesson in the same time over ref.parentId
	 * TODO: performance increase to patch all childs from section with own request over ref.parentId marker
	 * -> Tasks should do after finish section model
	 * @param {ObjectId} ressourceId - Map to type section, or lesson
	 * @param {Object} [{[childs] , [visible], [type]}]
	 * Is type lesson, you can set child true/false to update child sections from this lesson too
	 */
	async patch(ressourceId, { childs = true, visible = true, type = 'lesson' }, params) {
		const v = convertTo.boolean(visible);
		const { patched, overview } = await this.request(this.serviceType[type], ressourceId, params, v);
		patched.type = type;

		if (childs && Array.isArray(overview.sections) && overview.sections.length > 0) {
			const patchedSections = await this.batchRequest(overview.sections, params, v);
			patched.sections = patchedSections.map((res) => res.patched);
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
