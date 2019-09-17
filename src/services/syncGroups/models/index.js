const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/utils');

const { Schema } = mongoose;

const syncGroupSchema = new Schema({
	users: [{ type: Schema.Types.ObjectId }],
	permission: { type: String, enum: ['read', 'write'], default: 'read' },
	lessonId: { type: Schema.Types.ObjectId },
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdBy: { type: Schema.Types.ObjectId },
	updatedBy: { type: Schema.Types.ObjectId },
}, {
	timestamps: true,
});

syncGroupSchema
	.post('find', addTypeString('syncGroup'))
	.post('findOne', addTypeString('syncGroup'));

module.exports = {
	SyncGroupModel: mongoose.model('syncGroup', syncGroupSchema),
};
