const mongoose = require('mongoose');

const { Schema } = mongoose;

const stepSchema = new Schema({
	note: { type: String, default: '' },
	documents: [{ type: Schema.Types.ObjectId, ref: 'document', required: true }],
});

const lessonSchema = new Schema({
	steps: [{ type: stepSchema }],
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	students: { type: Schema.Types.ObjectId, ref: 'group', default: null },
	state: {
		type: Object,
		get: (data) => {
			try {
				return JSON.parse(data);
			} catch (err) {
				return data;
			}
		},
		set: data => JSON.stringify(data),
		default: {},
	},
}, {
	timestamps: true,
});

const lessonModel = mongoose.model('lesson', lessonSchema);

module.exports = {
	lessonModel,
	lessonSchema,
	stepSchema,
};
