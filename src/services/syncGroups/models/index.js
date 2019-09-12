const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const userNamesSchema = new Schema({
	user: [{ type: Schema.Types.ObjectId, require: true }],
	name: { type: String, require: true },
});

const syncGroupSchema = new Schema({
	users: [{ type: Schema.Types.ObjectId }],
	userNames: [userNamesSchema],
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
	GroupModel: mongoose.model('syncGroup', syncGroupSchema),
};
