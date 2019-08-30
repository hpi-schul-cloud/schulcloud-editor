const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const viewportSchema = new Schema({
	userId: [{ type: Schema.Types.ObjectId, required: true }],
	sectionposition: { type: Number, default: 0 },
	sectionUserViewId: { type: Schema.Types.ObjectId, default: null }, // todo: ref
	additional: { type: Object, default: null },
}, {
	timestamps: true,
});

viewportSchema
	.post('find', addTypeString('viewport'))
	.post('findOne', addTypeString('viewport'));

module.exports = {
	ViewportModel: mongoose.model('viewport', viewportSchema),
};
