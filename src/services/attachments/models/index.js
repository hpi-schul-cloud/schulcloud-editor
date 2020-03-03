const mongoose = require('mongoose');

const { addTypeString } = require('../../../utils');

const { Schema } = mongoose;

const targetModels = ['lesson', 'section'];

const attachmentSchema = new Schema({
	title: { type: String },
	description: { type: String },
	type: { type: String, required: true },
	value: { type: Schema.Types.Mixed, default: null }, // Object, Number, String, Boolean
	target: {
		type: Schema.Types.ObjectId,
		refPath: 'targetModel',
		required: function requiredTarget() {
			return !!this.targetModel;
		},
	},
	targetModel: {
		type: String,
		enum: targetModels,
		required: function requiredTargetModel() {
			return !!this.target;
		},
	},
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdBy: { type: Schema.Types.ObjectId },
	updatedBy: { type: Schema.Types.ObjectId },
}, {
	timestamps: true,
});

attachmentSchema
	.post('find', addTypeString('attachment'))
	.post('findOne', addTypeString('attachment'));

module.exports = {
	AttachmentModel: mongoose.model('attachment', attachmentSchema),
};
