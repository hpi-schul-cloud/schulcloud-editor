const mongoose = require('mongoose');

const { addTypeString } = require('../../../utils');
const { permissionSchema } = require('../../permissionsHelper/models');

const { Schema } = mongoose;

const lessonSchema = new Schema({
	title: { type: String, default: '' },
	courseId: { type: Schema.Types.ObjectId, required: true },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section' }],
	permissions: [{ type: permissionSchema }],
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdBy: { type: Schema.Types.ObjectId },
	updatedBy: { type: Schema.Types.ObjectId },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	position: { type: Number, default: Date.now },
	fork: { type: Schema.Types.ObjectId }, // is forked from
}, {
	timestamps: true,
});

/* lessonSchema
	.post('find', after('lesson'))
	.post('findOne', after('lesson'));
*/

/* TODO: think about to be conform to the rest of the editor dokument
lessonSchema
	.post('find', addTypeString('lesson')
*/

module.exports = {
	LessonModel: mongoose.model('lesson', lessonSchema),
};
