const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/utils');
const { permissionSchema } = require('../../permissionsHelper/models');

const { Schema } = mongoose;

const targets = ['course', 'lesson', 'group'];

const ref = new Schema({
	target: {
		type: Schema.Types.ObjectId,
		refPath: 'targetModel',
		required: function requiredTarget() {
			return !!this.targetModel;
		},
	},
	targetModel: {
		type: String,
		enum: targets,
		required: function requiredTargetModel() {
			return !!this.target;
		},
	},
}, {
	_id: false,
});

const sectionSchema = new Schema({
	ref: { type: ref },
	context: {
		type: String,
		enum: ['task', 'section'],
		default: 'section',
		immutable: true,
	},
	title: { type: String, default: '' },
	state: { type: Object, default: {} },
	permissions: [{ type: permissionSchema }],
	deletedAt: { type: Date, expires: (60 * 60 * 24 * 30) },
	createdBy: { type: Schema.Types.ObjectId, immutable: true },
	updatedBy: { type: Schema.Types.ObjectId },
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
