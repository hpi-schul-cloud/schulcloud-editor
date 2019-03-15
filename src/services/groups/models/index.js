const mongoose = require('mongoose');

const { Schema } = mongoose;

// todo test if context is needed
const groupSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	type: { type: String, default: 'group', enum: ['group'] },
	owner: { type: Schema.Types.ObjectId },
	users: [{ type: Schema.Types.ObjectId }],
}, {
	timestamps: true,
});

function autoSelect(next) {
	this.select('-createdAt -updatedAt -__v');
	next();
}

groupSchema
	.pre('findOne', autoSelect)
	.pre('find', autoSelect);

const GroupModel = mongoose.model('group', groupSchema);

module.exports = {
	GroupModel,
	groupSchema,
};
