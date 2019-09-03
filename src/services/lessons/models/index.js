const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const lessonSchema = new Schema({
	title: { type: String, default: '' },
	courseId: { type: Schema.Types.ObjectId },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section' }],
	permissions: [{ type: Object }],
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdFrom: { type: Schema.Types.ObjectId },
}, {
	timestamps: true,
});

function autoPopulate(next) {
	this.populate('sections');
	next();
}

lessonSchema
	.pre('findOne', autoPopulate)
	.post('find', addTypeString('lesson'))
	.post('findOne', addTypeString('lesson'));

module.exports = {
	LessonModel: mongoose.model('lesson', lessonSchema),
};
