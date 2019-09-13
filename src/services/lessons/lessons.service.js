/* eslint-disable class-methods-use-this */
const { NotFound } = require('@feathersjs/errors');
const { validateSchema } = require('feathers-hooks-common');
const Ajv = require('ajv');

const { create: createSchema, patch: patchSchema } = require('./schemes');

const logger = require('../../logger');
const { LessonModel } = require('./models/');
const { checkCoursePermission } = require('../../global/hooks');
const { setCourseId } = require('./hooks/setDefaults');

const hooks = {
	before: {
		find: [/* do some validation */checkCoursePermission('LESSON_VIEW')],
		get: [],
		create: [
			setCourseId,
			validateSchema(createSchema, Ajv),
			checkCoursePermission('LESSON_CREATE'),
		],
		patch: [
			validateSchema(patchSchema, Ajv),
		],
		remove: [

		],

	},

	after: {

	},

	error: {

	},
};

class Lessons {
	setup(app) {
		this.app = app;
	}

	async find(params) {
		const { route } = params;

		try {
			const lessons = await LessonModel.find({
				courseId: route.courseId,
				deletedAt: { $exists: false },
			}).select({
				_id: 1,
				title: 1,
				note: 1,
				visible: 1,
				courseId: 1,
				position: 1,
			}).lean().exec();

			return lessons || [];
		} catch (err) {
			logger.error(`Failed to find lessons: ${err}`);
			throw err;
		}
	}

	async get(id, params) {
		const { route } = params;
		let lesson;
		const mRequest = LessonModel
			.findOne({
				_id: id,
				courseId: route.courseId,
				deletedAt: { $exists: false },
			}).populate('sections')
			.select({
				_id: 1,
				title: 1,
				note: 1,
				sections: 1,
				courseId: 1,
			});

		if (params.all === 'true') {
			mRequest.populate('sections');
		}

		try {
			lesson = await mRequest.lean().exec();
		} catch (err) {
			logger.error(`Failed to get the lesson: ${err}`);
			throw err;
		}
		if (!lesson) throw new NotFound();

		return lesson;
	}

	async create(data, params) {
		const { user } = params;
		try {
			const lesson = new LessonModel({
				...data,
				createdBy: user.id,
			});
			await lesson.save();
			return;
		} catch (err) {
			logger.error(`Failed to create a lesson: ${err}`);
			throw err;
		}
	}

	async patch(id, data, params) {
		const { route } = params;

		try {
			return await LessonModel.updateOne({
				_id: id,
				courseId: route.courseId,
				deletedAt: { $exists: false },
			}, {
				...data,
			}).exec();
		} catch (err) {
			logger.error(`Failed to update the lesson ${err}`);
			throw err;
		}
	}

	async remove(id, params) {
		const { route } = params;
		try {
			const lesson = await LessonModel.findOne({
				_id: id,
				courseId: route.courseId,
			}).exec();

			lesson.deletedAt = new Date();
			await lesson.save();
			return;
		} catch (err) {
			logger.error(`Failed to delete the lesson ${err}`);
			throw err;
		}
	}
}

const joinLessonChannel = app => (user) => {
	app.channel(`lessons/${user.lesson}`).join(user.connection);
};


module.exports = {
	Lessons,
	hooks,
	joinLessonChannel,
};
