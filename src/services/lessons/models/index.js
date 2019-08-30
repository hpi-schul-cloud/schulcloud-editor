const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const lessonSchema = new Schema({
	title: { type: String, default: '' },
	courseId: { type: Schema.Types.ObjectId },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section' }],
	permissions: [],
}, {
	timestamps: true,
});

lessonSchema
	.post('find', addTypeString('lesson'))
	.post('findOne', addTypeString('lesson'));

module.exports = {
	LessonModel: mongoose.model('lesson', lessonSchema),
};
