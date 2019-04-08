const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * @param read Can read a section.
 * @param write Can edit a section, but can not modified the structure. Example: student answer a question.
 * @param create Can edit a section structure. Example: teacher can create and edit new answers.
 * @example {read:false, write:true, create:true} will allow you create new answers AND edit this answers. Read is override by the higher permissions.
 */
const permissionGroupSchema = new Schema({
	group: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	read: { type: Boolean, default: false },
	write: { type: Boolean, default: false },
	create: { type: Boolean, default: false },
});

const sectionSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	parent: { type: Schema.Types.ObjectId, ref: 'section', default: null },
	title: String,
	permissions: [{ type: permissionGroupSchema }],
	title: { type: String, default: '' },
	state: { type: Object, default: {} },
	flag: { type: String, enum: ['isFromStudent', 'isTemplate'], default: 'isTemplate' },
}, {
	timestamps: true,
	minimize: false,
});

function autoPopulate(next) {
	this.populate('permissions.group');
	this.populate('owner');
	next();
}

sectionSchema
	.pre('findOne', autoPopulate)
	.pre('find', autoPopulate);


function autoSelect(next) {
	this.select('-createdAt -updatedAt -__v');
	next();
}

sectionSchema
	.pre('findOne', autoSelect)
	.pre('find', autoSelect);


const SectionModel = mongoose.model('section', sectionSchema);


const sectionAttachmentSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
	key: { type: String, enum: ['nexboard'], required: true },
	value: { type: Schema.Types.Mixed, required: true },

});

const SectionAttachmentModel = mongoose.model('sectionAttachment', sectionAttachmentSchema);

module.exports = {
	SectionModel,
	sectionSchema,
	permissionGroupSchema,
	SectionAttachmentModel,
	sectionAttachmentSchema,
};
