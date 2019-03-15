const mongoose = require('mongoose');

const { Schema } = mongoose;

const collectionSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	items: [{ type: Schema.Types.ObjectId, ref: 'group' }],
	title: { type: String, default: '' },
}, {
	timestamps: true,
});

function autoSelect(next) {
	this.select('-createdAt -updatedAt -__v');
	next();
}

collectionSchema
	.pre('findOne', autoSelect)
	.pre('find', autoSelect);

const CollectionModel = mongoose.model('collection', collectionSchema);

module.exports = {
	CollectionModel,
	collectionSchema,
};
