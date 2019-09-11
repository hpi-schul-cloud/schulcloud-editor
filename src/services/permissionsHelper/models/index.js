const mongoose = require('mongoose');

const { Schema } = mongoose;

const permissionSchema = new Schema({
	group: { type: Schema.Types.ObjectId, ref: 'syncGroup' },
	users: [{ type: Schema.Types.ObjectId }],
	read: { type: Boolean, default: false },
	write: { type: Boolean, default: false },
	activated: { type: Boolean, default: false },
	publishDate: { type: Date, default: null },
	endDate: { type: Date, default: null },
	createdFrom: { type: Schema.Types.ObjectId, default: null },
	updatedBy: { type: Schema.Types.ObjectId, default: null },
}, {
	timestamps: true,
});

module.exports = {
	PermissionModel: mongoose.model('permission', permissionSchema),
};
