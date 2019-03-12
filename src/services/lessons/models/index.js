const mongoose = require('mongoose');

const { Schema } = mongoose;

const stepSchema = new Schema({
	note: { type: String, default: '' },
	visible: { type: Boolean, default: true },
	sections: [{ type: Schema.Types.ObjectId, ref: 'section', default: [] }],
});

const StepModel = mongoose.model('step', stepSchema);

const lessonSchema = new Schema({
	steps: [{ type: stepSchema, default: [] }],
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	users: { type: Schema.Types.ObjectId, ref: 'group' },
}, {
	timestamps: true,
});

function autoPopulate(next) {
	this.populate('steps.sections');
	this.populate('owner');
	this.populate('users');
	next();
}

lessonSchema
	.pre('findOne', autoPopulate)
	.pre('find', autoPopulate);

const LessonModel = mongoose.model('lesson', lessonSchema);

module.exports = {
	LessonModel,
	lessonSchema,
	stepSchema,
	StepModel,
};
