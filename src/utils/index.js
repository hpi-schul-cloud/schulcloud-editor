const batchOperations = require('./batchOperations');
const mongoose = require('./mongoose');
const pagination = require('./pagination');
const params = require('./params');
const query = require('./query');
const permissions = require('./permissions');

// permissions - Operations
exports.permissions = permissions;

// batchOperations
exports.removeKeyFromList = batchOperations.removeKeyFromList;

// mongoose - Operations
exports.addTypeString = mongoose.addTypeString;

// paginate - Operations
exports.paginate = pagination.paginate;

// params - Operations
exports.prepareParams = params.prepareParams;
exports.modifiedParamsToReturnPatchResponse = params.modifiedParamsToReturnPatchResponse;

// query - Operations
exports.dataToSetQuery = query.dataToSetQuery;
exports.convertSuccessMongoPatchResponse = query.convertSuccessMongoPatchResponse;
