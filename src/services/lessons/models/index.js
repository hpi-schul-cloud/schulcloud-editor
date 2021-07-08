const mongoose = require('mongoose');

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
	hash: { type: String },
	position: { type: Number, default: Date.now },
	fork: { type: Schema.Types.ObjectId }, // is forked from
}, {
	timestamps: true,
});

module.exports = {
	LessonModel: mongoose.model('lesson', lessonSchema),
};
