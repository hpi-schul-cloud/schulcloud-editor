const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * @param read Can read a section.
 * @param write Can edit a section, but can not modified the structure. Example: student answer a question.
 * @param create Can edit a section structure. Example: teacher can create and edit new answers.
 * @example {read:false, write:true, create:true} will allow you create new answers AND edit this answers. Read is override by the higher permissions.
 */
const permissionSchema = new Schema({
	read: { type: Boolean, default: false },
	write: { type: Boolean, default: false },
	create: { type: Boolean, default: false },
});

const permissionGroupSchema = new Schema({
	group: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	permission: { type: permissionSchema },
});

const sectionSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', default: null },
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	parent: { type: Schema.Types.ObjectId, ref: 'group', default: null },
	permissions: [{ type: permissionGroupSchema }],
	state: {
		type: Object,
	/*	get: (data) => {	// replace if we use Objects
			try {
				return JSON.parse(data);
			} catch (err) {
				return data;
			}
		},
		set: data => JSON.stringify(data), */
		default: {},
	},
	flag: { type: String, enum: ['isFromStudent', 'isTemplate'], default: 'isTemplate' },
}, {
	timestamps: true,
});

const sectionModel = mongoose.model('section', sectionSchema);

module.exports = {
	sectionModel,
	sectionSchema,
	permissionGroupSchema,
	permissionSchema,
};
