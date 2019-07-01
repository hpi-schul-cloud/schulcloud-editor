const mongoose = require('mongoose');

const { addDocType } = require('../../../global/helpers');

const { Schema } = mongoose;

// todo test if context is needed
const groupSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	owner: { type: Schema.Types.ObjectId, required: true },
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
	.pre('find', autoSelect)
	.post('find', addDocType('group'))
	.post('findOne', addDocType('group'));

const GroupModel = mongoose.model('group', groupSchema);

module.exports = {
	GroupModel,
	groupSchema,
};
