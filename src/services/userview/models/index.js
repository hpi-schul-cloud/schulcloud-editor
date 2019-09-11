const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const userviewSchema = new Schema({
	permissions: [{ type: Object }],
	parent: { type: Schema.Types.ObjectId, ref: 'sections', required: true },
	state: { type: Object, default: null },
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdFrom: { type: Schema.Types.ObjectId, default: null },
	updatedBy: { type: Schema.Types.ObjectId, default: null },
}, {
	timestamps: true,
});

userviewSchema
	.post('find', addTypeString('userview'))
	.post('findOne', addTypeString('userview'));

module.exports = {
	UserviewModel: mongoose.model('userview', userviewSchema),
};
