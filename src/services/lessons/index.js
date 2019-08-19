/* eslint-disable class-methods-use-this */
const service = require('feathers-mongoose');
const logger = require('../../logger');

const { LessonModel } = require('./models/');
const hooks = require('./hooks/');

class Lessons {
	constructor() {

	}

	async find(params) {
		try {
			const lessons = await LessonModel.find({
				courseId: params.courseId,
			}).lean().exec();

			return lessons;
		} catch (err) {
			logger.error(`Failed to find lesson: ${err}`);
			throw err;
		}
	}

	async get(id, params) {
		const mRequest = LessonModel.findOne({
			_id: id,
		});

		if (params.all === 'true') {
			mRequest.populate('sections');
		}

		try {
			return await mRequest.lean().exec();
		} catch (err) {
			logger.error(`Failed to get a lesson: ${err}`);
			throw err;
		}
	}

	async create(data, params) {
		try {
			params.courseId
			const lesson = new LessonModel(data);
			return await lesson.save();
		} catch (err) {
			logger.error(`Failed to create a lesson: ${err}`);
			throw err;
		}
	}

	async patch(id, data, params) {
		try {
			let lesson = LessonModel.findById(id);
			lesson = {
				...lesson,
				...data,
			};
			return await lesson.save();
		} catch (err) {
			logger.error(`Failed to update a lesson ${err}`);
			throw err;
		}
	}

	async remove(id, params) {

	}
}


module.exports = function setup() {
	const app = this;
	app.use('lessons', new Lessons());
	const lessonsService = app.service('lessons');
	lessonsService.hooks(hooks);
};
