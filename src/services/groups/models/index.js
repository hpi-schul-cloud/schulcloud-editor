const mongoose = require('mongoose');

const { Schema } = mongoose;

const groupSchema = new Schema({
	users: [{ type: Schema.Types.ObjectId }],
}, {
	timestamps: true,
});

const groupModel = mongoose.model('group', groupSchema);

module.exports = {
	groupModel,
	groupSchema,
};
