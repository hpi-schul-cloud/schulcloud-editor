const mongoose = require('mongoose');

const { Schema } = mongoose;

const permissionSchema = new Schema({
	write: { type: Boolean, default: true },
	read: { type: Boolean, default: true },
	create: { type: Boolean, default: true },
	delete: { type: Boolean, default: true },
});

const permissionGroupSchema = new Schema({
	group: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	permission: { type: permissionSchema },
});

const documentSchema = new Schema({
	lesson: { type: Schema.Types.ObjectId, ref: 'lesson', default: null },
	owner: { type: Schema.Types.ObjectId, ref: 'group', required: true },
	parent: { type: Schema.Types.ObjectId, ref: 'group', default: null },
	permissions: [{ type: permissionGroupSchema }],
	state: {
		type: Object,
		get: (data) => {
			try {
				return JSON.parse(data);
			} catch (err) {
				return data;
			}
		},
		set: data => JSON.stringify(data),
		default: {},
	},
	flag: { type: String, enum: ['isFromStudent', 'isTemplate'], default: 'isTemplate' },
}, {
	timestamps: true,
});

const documentModel = mongoose.model('document', documentSchema);

module.exports = {
	documentModel,
	documentSchema,
	permissionGroupSchema,
	permissionSchema,
};
