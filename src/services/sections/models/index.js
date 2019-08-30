const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const sectionSchema = new Schema({
	parent: [{ type: Schema.Types.ObjectId, ref: 'lesson', default: null }], // todo: required ?
	title: { type: String, default: '' },
	state: { type: Object, default: {} },
	permissions: [],
}, {
	timestamps: true,
	minimize: false, // to return empty objects
});

sectionSchema
	.post('find', addTypeString('section'))
	.post('findOne', addTypeString('section'));

module.exports = {
	SectionModel: mongoose.model('section', sectionSchema),
};
