const mongoose = require('mongoose');

const { addTypeString } = require('../../../utils');

const { Schema } = mongoose;

const groupviewSchema = new Schema({
	permissions: [{ type: Object }],
	parent: { type: Schema.Types.ObjectId, ref: 'sections', required: true },
	state: { type: Object, default: null }, // pluginData array[{id, data}]
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdFrom: { type: Schema.Types.ObjectId, default: null },
	updatedBy: { type: Schema.Types.ObjectId, default: null },
}, {
	timestamps: true,
});

groupviewSchema
	.post('find', addTypeString('groupview'))
	.post('findOne', addTypeString('groupview'));

module.exports = {
	GroupViewModel: mongoose.model('groupview', groupviewSchema),
};
