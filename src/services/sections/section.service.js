const { Forbidden, BadRequest } = require('@feathersjs/errors');
const { disallow } = require('feathers-hooks-common');
const { validateSchema } = require('feathers-hooks-common');
const Ajv = require('ajv');

const { filterOutResults, joinChannel, createChannel } = require('../../global/hooks');
const {
	prepareParams,
	permissions,
	convertSuccessMongoPatchResponse,
	modifiedParamsToReturnPatchResponse,
} = require('../../utils');

const { diffToMongo } = require('./utils');

const {
	create: createSchema,
	patch: patchSchema,
} = require('./schemas');

const SectionServiceHooks = {};
SectionServiceHooks.before = {
	all: [],
	find: [
	],
	get: [
	],
	create: [
		validateSchema(createSchema, Ajv),
	],
	update: [
		disallow(),
	],
	patch: [
		validateSchema(patchSchema, Ajv),
	],
	remove: [
	],
};

SectionServiceHooks.after = {
	all: [
		filterOutResults('permissions'),
	],
	find: [
		joinChannel('sections'),
	],
	get: [
		joinChannel('sections'),
	],
	create: [
		createChannel('sections', {
			from: 'lessons',
			prefixId: 'lessonId',
		}),
	],
};

SectionServiceHooks.error = {
	all: [],
};

class SectionService {
	constructor({ docs = {} }) {
		this.docs = docs;
		this.baseService = 'models/SectionModel';
		this.err = {
			softDelete: 'Can not set soft delete.',
			noAccess: 'You have no access.',
			createWithoutPermissionGroups: 'Something are wrong please check your request. (1)',
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

	async find(params) {
		const internParams = this.setScope(prepareParams(params));
		const sections = await this.app.service(this.baseService)
			.find(internParams);
		const filtered = permissions.filterHasRead(sections.data, params.user);

		filtered.map((section) => {
			section.visible = !permissions.couldAnyoneOnlyRead(section.permissions);
			return section;
		});

		sections.data = filtered;
		return sections;
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
		const { app } = this;
		const { lessonId } = params.route;
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
		const result = await service.patch(_id, { deletedAt }, patchParams)
			.then(res => convertSuccessMongoPatchResponse(res, { _id, deletedAt }, true));

		await app.service('models/LessonModel')
			.patch(lessonId,
				{ $pull: { sections: section._id } },
				prepareParams(params));
		return result;
	}

	async create(data, params) {
		const { route: { lessonId }, user, payload = {} } = params;
		const { app } = this;

		// todo refactor later -> context and ref
		data.ref = {
			target: lessonId,
			targetModel: 'lesson',
		};
		data.context = 'section';

		let syncGroups;
		if (payload.syncGroups) {
			({ syncGroups } = payload);
		} else {
			// todo only write group as default?
			const internParams = prepareParams(params);
			internParams.query.lessonId = lessonId;
			const syncGroupsResponse = await app.service('models/syncGroup').find(internParams);
			syncGroups = syncGroupsResponse.data;
		}

		if (syncGroups.length <= 0) {
			throw new Forbidden(this.err.createWithoutPermissionGroups);
		}

		// check permissions -> userId must exist in own of the syncGroups with write permissions
		const syncGroupWritePermission = syncGroups.filter(g => g.permission === 'write');
		if (!permissions.isInUsers(syncGroupWritePermission, user.id)) {
			throw new Forbidden(this.err.noAccess);
		}

		const permService = app.service('lesson/:lessonId/sections/:ressourceId/permission');
		const key = permService.permissionKey;
		data[key] = await permService.createDefaultPermissionsData(syncGroups);

		// TODO: add try catch
		const section = await this.app.service(this.baseService)
			.create(data, prepareParams(params));

		if (!payload.syncGroups) {
			await app.service('models/LessonModel')
				.patch(lessonId,
					{ $push: { sections: section._id } },
					prepareParams(params));
		}

		return {
			_id: section._id,
		};
	}

	manageStateDiffsIfProvided(data) {
		if (data.stateDiff && data.state) {
			throw new BadRequest('You can not provide state and stateDiff in same request.');
		}
		if (data.stateDiff) {
			data.state = diffToMongo(data.stateDiff, 'state');
		}
		return data;
	}

	async patch(id, data, params) {
		const internParams = this.setScope(prepareParams(params));
		internParams.query.$select = ['permissions'];

		const service = this.app.service(this.baseService);
		const section = await service.get(id, internParams);

		if (!permissions.hasWrite(section.permissions, params.user)) {
			throw new Forbidden(this.err.noAccess);
		}


		return service.patch(id, this.manageStateDiffsIfProvided(data), internParams);
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	SectionService,
	SectionServiceHooks,
};
