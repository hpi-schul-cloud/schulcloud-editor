const mongoose = require('mongoose');

const { after } = require('../../../global/helpers');

const { Schema } = mongoose;

const lessonSchema = new Schema({
	title: { type: String, required: true },
	note: { type: String },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section' }],
	permissons: [{ type: Schema.Types.ObjectId, ref: '' }],
	type: { type: String, default: 'lesson', enum: ['lesson'] },
	visible: { type: Boolean, default: true },
	courseId: { type: Schema.Types.ObjectId },
	position: { type: Number, default: (new Date().getTime()) },
	fork: { type: Schema.Types.ObjectId }, // is forked from
	deletedAt: { type: Date },
}, {
	timestamps: true,
});

lessonSchema
	.post('find', after('lesson'))
	.post('findOne', after('lesson'));

function autoSelect(next) {
	this.select('-createdAt -updatedAt -__v');
	next();
}

lessonSchema
	.pre('findOne', autoSelect)
	.pre('find', autoSelect);

const LessonModel = mongoose.model('lesson', lessonSchema);

module.exports = {
	LessonModel,
	lessonSchema,
};
