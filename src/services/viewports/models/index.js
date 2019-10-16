const mongoose = require('mongoose');

const { addTypeString } = require('../../../utils');

const { Schema } = mongoose;

const viewportSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, required: true },
	permissions: [{ type: Object }],
	sectionposition: { type: Number, default: 0 },
	sectionUserViewId: { type: Schema.Types.ObjectId, ref: 'userview' },
	additional: { type: Object, default: null },
	lessonId: { type: Schema.Types.ObjectId, ref: 'lesson' },
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdBy: { type: Schema.Types.ObjectId },
	updatedBy: { type: Schema.Types.ObjectId },
}, {
	timestamps: true,
});

viewportSchema
	.post('find', addTypeString('viewport'))
	.post('findOne', addTypeString('viewport'));

module.exports = {
	ViewportModel: mongoose.model('viewport', viewportSchema),
};
