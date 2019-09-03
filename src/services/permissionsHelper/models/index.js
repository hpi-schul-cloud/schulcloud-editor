const mongoose = require('mongoose');

const { Schema } = mongoose;

const permissionSchema = new Schema({
	group: { type: Schema.Types.ObjectId, ref: 'group' },
	users: [{ type: Schema.Types.ObjectId }],
	read: { type: Boolean, default: false },
	write: { type: Boolean, default: false },
	activated: { type: Boolean, default: false },
	pubishDate: { type: Date, default: null },
	endDate: { type: Date, default: null },
}, {
	timestamps: true,
});

module.exports = {
	PermissionModel: mongoose.model('permission', permissionSchema),
};
