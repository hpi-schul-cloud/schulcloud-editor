const { Forbidden } = require('@feathersjs/errors');
const { disallow } = require('feathers-hooks-common');

const { filterOutResults } = require('../../global/hooks');
const {
	prepareParams,
	permissions,
	removeKeyFromList,
	convertSuccessMongoPatchResponse,
	modifiedParamsToReturnPatchResponse,
} = require('../../global/utils');

// todo validation
const SectionServiceHooks = {};
SectionServiceHooks.before = {
	all: [],
	find: [
	],
	get: [
	],
	create: [
	],
	update: [
		disallow(),
	],
	patch: [
	],
	remove: [
	],
};

SectionServiceHooks.after = {
	all: [
		filterOutResults('permissions'),
	],
};

SectionServiceHooks.error = {
	all: [
	/*	(context) => {
			if (context.error) {
				throw new Forbidden('Can not execute', context.error);
			}
		}, */
	],
};

class SectionService {
	constructor({ docs = {} }) {
		this.docs = docs;
		this.baseService = 'models/SectionModel';
		this.err = {
			softDelete: 'Can not set soft delete.',
			noAccess: 'You have no access.',
		};
	}

	setScope(params) {
		const { lessonId } = params.route;
		params.query.context = 'section';
		params.query.ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		params.query.$populate = [
			{ path: 'permissions.group', select: 'users' },
		];
		return params;
	}

	find(params) {
		const internParams = this.setScope(prepareParams(params));
		return this.app.service(this.baseService)
			.find(internParams)
			.then((sections) => {
				const data = permissions.filterHasRead(sections.data, params.user);
				sections.data = removeKeyFromList(data, 'permissions');
				sections.total = sections.data.length;
				return sections;
			});
	}

	get(id, params) {
		const internParams = this.setScope(prepareParams(params));
		return this.app.service(this.baseService)
			.get(id, internParams)
			.then((section) => {
				if (!permissions.hasRead(section.permissions, params.user)) {
					throw new Forbidden(this.err.noAccess);
				}
				return section;
			});
	}

	async remove(_id, params) {
		const internParams = this.setScope(prepareParams(params));
		internParams.query.$select = ['permissions'];

		const service = this.app.service(this.baseService);
		const section = await service.get(_id, internParams);

		if (!permissions.hasWrite(section.permissions, params.user)) {
			throw new Forbidden(this.err.noAccess);
		}
		// The query operation is also execute in mongoose after it is patched.
		// But deletedAt exist as select and without mongoose.writeResult = true it return nothing.
		const deletedAt = new Date();
		const patchParams = modifiedParamsToReturnPatchResponse(prepareParams(params));
		return service.patch(_id, { deletedAt }, patchParams)
			.then(res => convertSuccessMongoPatchResponse(res, { _id, deletedAt }, true));
	}

	async create(data, params) {
		const { route: { lessonId }, user } = params;
		const { app } = this;

		data.ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		data.context = 'section';

		const internParams = prepareParams(params);
		internParams.query.lessonId = lessonId;
		// todo only write group as default?
		const { data: syncGroups } = await app.service('models/syncGroup').find(internParams);

		// check permissions -> userId must exist in own of the syncGroups with write permissions
		const syncGroupWritePermission = syncGroups.filter(g => g.permission === 'write');
		if (!permissions.utils.IsInUsers(syncGroupWritePermission, user.id)) {
			throw new Forbidden(this.err.noAccess);
		}

		const permService = app.service('lesson/:lessonId/sections/:ressourceId/permission');
		const key = permService.permissionKey;
		data[key] = await permService.createDefaultPermissionsData(syncGroups);

		return this.app.service(this.baseService)
			.create(data, prepareParams(params))
			.then(({ _id }) => ({ _id }));
	}

	async patch(id, data, params) {
		const internParams = this.setScope(prepareParams(params));
		internParams.query.$select = ['permissions'];

		const service = this.app.service(this.baseService);
		const section = await service.get(id, internParams);

		if (!permissions.hasWrite(section.permissions, params.user)) {
			throw new Forbidden(this.err.noAccess);
		}

		return service.patch(id, data, internParams);
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	SectionService,
	SectionServiceHooks,
};
