const mongoose = require('mongoose');

const { Schema } = mongoose;

const collectionSchema = new Schema({
	items: [{ type: Schema.Types.ObjectId, refPath: 'targetModel' }],
	targetModel: {
		type: String,
		enum: ['group', 'lesson'],	// collection is removed, hard to restricted, document is mapped over lessons
	},
}, {
	timestamps: true,
});

const CollectionModel = mongoose.model('collection', collectionSchema);

module.exports = {
	CollectionModel,
	collectionSchema,
};
