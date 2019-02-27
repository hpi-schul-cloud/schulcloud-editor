const mongoose = require('mongoose');

const { Schema } = mongoose;

const groupSchema = new Schema({
	owner: { type: Schema.Types.ObjectId },
	users: [{ type: Schema.Types.ObjectId }],
}, {
	timestamps: true,
});

const groupModel = mongoose.model('group', groupSchema);

module.exports = {
	groupModel,
	groupSchema,
};
