const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const lessonSchema = new Schema({
	title: { type: String, required: true },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section' }],
	updatedFrom: { type: Schema.Types.ObjectId, default: null },
	createdFrom: { type: Schema.Types.ObjectId, default: null },
	visible: { type: Boolean, default: true },
	courseId: { type: Schema.Types.ObjectId },
	position: { type: Number, default: Date.now },
	fork: { type: Schema.Types.ObjectId }, // is forked from
	// soft delete, will be deleted after one month (s * m * h * d)
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	permissions: [{ type: Object }],
}, {
	timestamps: true,
});

/* lessonSchema
	.post('find', after('lesson'))
	.post('findOne', after('lesson'));
*/
const LessonModel = mongoose.model('lesson', lessonSchema);

module.exports = {
	LessonModel: mongoose.model('lesson', lessonSchema),
};
