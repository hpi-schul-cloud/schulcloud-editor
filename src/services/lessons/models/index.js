const mongoose = require('mongoose');

const { Schema } = mongoose;

const stepSchema = new Schema({
	note: { type: String, default: '' },
	visible: { type: Boolean, default: true },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section', required: true }],
});

const lessonSchema = new Schema({
	steps: [{ type: stepSchema }],
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	students: { type: Schema.Types.ObjectId, ref: 'group', default: null },
}, {
	timestamps: true,
});

const lessonModel = mongoose.model('lesson', lessonSchema);

module.exports = {
	lessonModel,
	lessonSchema,
	stepSchema,
};
