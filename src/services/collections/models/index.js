const mongoose = require('mongoose');

const { Schema } = mongoose;

const collectionSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	groups: [{ type: Schema.Types.ObjectId, ref: 'group' }],
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	title: { type: String, default: '' },
}, {
	timestamps: true,
});


function autoPopulate(next) {
	this.populate('groups');
	this.populate('owner');
	next();
}

collectionSchema
	.pre('findOne', autoPopulate)
	.pre('find', autoPopulate);

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
