const mongoose = require('mongoose');

const { Schema } = mongoose;

// todo test if context is needed
const groupSchema = new Schema({
	type: { type: String, default: 'group', enum: ['group'] },
	owner: { type: Schema.Types.ObjectId },
	users: [{ type: Schema.Types.ObjectId }],
}, {
	timestamps: true,
});

const GroupModel = mongoose.model('group', groupSchema);

module.exports = {
	GroupModel,
	groupSchema,
};
