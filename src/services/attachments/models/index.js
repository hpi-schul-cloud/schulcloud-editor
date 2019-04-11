const mongoose = require('mongoose');

const { Schema } = mongoose;

const attachmentSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	key: { type: String, enum: ['nexboard'], required: true },
	uri: { type: String, default: null },
	value: { type: Schema.Types.Mixed, default: null },
});

const AttachmentModel = mongoose.model('attachment', attachmentSchema);

module.exports = {
	AttachmentModel,
	attachmentSchema,
};
