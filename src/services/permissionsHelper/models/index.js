const mongoose = require('mongoose');

const { addTypeString } = require('../../../global/helpers');

const { Schema } = mongoose;

const permissionSchema = new Schema({
	group: [{ type: Schema.Types.ObjectId, ref: 'group', required: true }],
	users: [{ type: Schema.Types.ObjectId }],
	read: { type: Boolean, default: false },
	write: { type: Boolean, default: false },
	activated: { type: Boolean, default: true },
	pubishDate: {},
	endDate: {},
}, {
	timestamps: true,
});

permissionSchema
	.post('find', addTypeString('permission'))
	.post('findOne', addTypeString('permission'));

module.exports = {
	PermissionModel: mongoose.model('permission', permissionSchema),
};
