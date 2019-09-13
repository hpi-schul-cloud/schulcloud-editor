const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/util');

const { Schema } = mongoose;

// @deprecated
const userNamesSchema = new Schema({
	id: { type: Schema.Types.ObjectId, require: true },
	name: { type: String, require: true },
}, { _id: false });

const syncGroupSchema = new Schema({
	users: [{ type: Schema.Types.ObjectId }],
	permission: { type: String, enum: ['read', 'write'], default: 'read' },
	courseId: { type: Schema.Types.ObjectId },
	// userNames: [userNamesSchema],
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
