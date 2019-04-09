const mongoose = require('mongoose');

const { after } = require('../../../global/helpers');

const { Schema } = mongoose;

const collectionSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	groups: [{ type: Schema.Types.ObjectId, ref: 'group' }],
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	title: { type: String, default: '' },
	type: { type: String, default: 'collection', enum: ['collection'] },
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
	.pre('find', autoPopulate)
	.post('find', after('collection'))
	.post('findOne', after('collection'));

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
