const Ajv = require('ajv');
const { Forbidden, BadRequest } = require('@feathersjs/errors');
const { disallow, validateSchema } = require('feathers-hooks-common');

const {
	filterOutResults,
	joinChannel,
	createChannel,
} = require('../../global/hooks');
const {
	prepareParams,
	permissions,
	convertSuccessMongoPatchResponse,
	modifiedParamsToReturnPatchResponse,
	setUserScopePermission,
	setUserScopePermissionForFindRequests,
} = require('../../utils');
const {
	diffToMongo,
	filterManyByHashes,
	filterStateByHash,
} = require('./utils');
const {
	create: createSchema,
	patch: patchSchema,
} = require('./schemas');

const SectionServiceHooks = {
	before: {
		create: [
			validateSchema(createSchema, Ajv),
		],
		update: [
			disallow(),
		],
		patch: [
			validateSchema(patchSchema, Ajv),
		],
	},
	after: {
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
	},
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
		let filtered = permissions.filterHasRead(sections.data, params.user);
		filtered = filterManyByHashes(filtered, params.query.hashes);
		filtered.forEach((section) => {
			section.visible = !permissions.couldAnyoneOnlyRead(section.permissions);
			return section;
		});

		sections.data = filtered;
		return setUserScopePermissionForFindRequests(sections, params.user);
	}

	async get(id, params) {
		const internParams = this.setScope(prepareParams(params));
		const section = await this.app.service(this.baseService).get(id, internParams);
		if (!permissions.hasRead(section.permissions, params.user)) {
			throw new Forbidden(this.err.noAccess);
		}
		section.timestamp = section.updatedAt;
		const filteredSection = filterStateByHash(section, params.query.hash);
		const result = await setUserScopePermission(filteredSection, filteredSection.permissions, params.user);
		return result;
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
		// TODO: Maybe modifiedParamsToReturnPatchResponse and convertSuccessMongoPatchResponse can removed?
		// -> Please show in attachment services deleted.
		const patchParams = modifiedParamsToReturnPatchResponse(prepareParams(params));
		const result = await service.patch(_id, { deletedAt }, patchParams)
			.then((res) => convertSuccessMongoPatchResponse(res, { _id, deletedAt }, true));

		await app.service('models/LessonModel')
			.patch(lessonId,
				{ $pull: { sections: section._id } },
				prepareParams(params));
		return setUserScopePermission(result, 'write');
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
		// todo remove if switch to intern call by lesson default section call
		if (payload.syncGroups) {
			({ syncGroups } = payload);
		} else {
			// todo only write group as default?
			const internParams = prepareParams(params);
			internParams.query.lessonId = lessonId;
			const syncGroupsResponse = await app.service('models/syncGroup').find(internParams);
			syncGroups = syncGroupsResponse.data;
		}

		// todo check if can return by intern call by lesson default section call
		if (syncGroups.length <= 0) {
			throw new Forbidden(this.err.createWithoutPermissionGroups);
		}

		// check permissions -> userId must exist in own of the syncGroups with write permissions
		const syncGroupWritePermission = syncGroups.filter((g) => g.permission === 'write');
		if (!permissions.isInUsers(syncGroupWritePermission, user.id)) {
			throw new Forbidden(this.err.noAccess);
		}

		const permService = app.service('lesson/:lessonId/sections/:ressourceId/permission');
		const key = permService.permissionKey;
		data[key] = await permService.createDefaultPermissionsData(syncGroups);

		// TODO: add try catch and role back for patch from lessons
		const section = await this.app.service(this.baseService)
			.create(data, prepareParams(params));

		// If section is created over the lesson, the lesson do not exist
		// todo remove if switch to intern call by lesson default section call
		if (!payload.syncGroups) {
			await app.service('models/LessonModel')
				.patch(lessonId,
					{ $push: { sections: section._id } },
					prepareParams(params));
		}

		return setUserScopePermission({
			_id: section._id,
		}, 'write');
	}

	manageStateDiffsIfProvided(data) {
		if (data.stateDiff && data.state) {
			throw new BadRequest('You can not provide state and stateDiff in same request.');
		}
		if (data.stateDiff) {
			const changes = diffToMongo(data.stateDiff, 'state');
			// $set, $pull, $unset is override from changes
			const newData = { ...data, ...changes };
			return newData;
		}
		return data;
	}

	async patch(id, data, params) {
		const internParams = this.setScope(prepareParams(params));
		internParams.query.$select = ['permissions', 'state'];

		const service = this.app.service(this.baseService);
		const section = await service.get(id, internParams);

		if (!permissions.hasWrite(section.permissions, params.user)) {
			throw new Forbidden(this.err.noAccess);
		}

		const { _id, state } = await service.patch(id, this.manageStateDiffsIfProvided(data), internParams);

		const response = { _id };
		const queryState = params.query.state;
		if (data.stateDiff && ['all', 'diff'].includes(queryState)) {
			response.stateDiff = data.stateDiff;
		}

		if (['all', 'state'].includes(queryState)) {
			response.state = state;
		}
		return setUserScopePermission(response, 'write');
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = {
	SectionService,
	SectionServiceHooks,
};
