const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const viewportSchema = new Schema({
	// userId: [{ type: Schema.Types.ObjectId, required: true }],
	permissions: [{ type: Object }],
	sectionposition: { type: Number, default: 0 },
	sectionUserViewId: { type: Schema.Types.ObjectId, default: null }, // todo: ref
	additional: { type: Object, default: null },
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdBy: { type: String, default: '' },
	updatedBy: { type: String, default: '' },
}, {
	timestamps: true,
});

viewportSchema
	.post('find', addTypeString('viewport'))
	.post('findOne', addTypeString('viewport'));

module.exports = {
	ViewportModel: mongoose.model('viewport', viewportSchema),
};
