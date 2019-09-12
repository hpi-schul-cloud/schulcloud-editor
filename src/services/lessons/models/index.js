const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const lessonSchema = new Schema({
	title: { type: String, required: true },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section' }],
	permissions: [{ type: Object }],
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdBy: { type: Schema.Types.ObjectId },
	updatedBy: { type: Schema.Types.ObjectId },
	visible: { type: Boolean, default: true },
	position: { type: Number, default: Date.now },
	fork: { type: Schema.Types.ObjectId }, // is forked from
}, {
	timestamps: true,
});

/* lessonSchema
	.post('find', after('lesson'))
	.post('findOne', after('lesson'));
*/

module.exports = {
	LessonModel: mongoose.model('lesson', lessonSchema),
};
