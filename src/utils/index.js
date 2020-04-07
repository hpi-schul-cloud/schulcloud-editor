const batchOperations = require('./batchOperations');
const mongoose = require('./mongoose');
const { paginate, isPaginated } = require('./pagination');
const params = require('./params');
const query = require('./query');
const permissions = require('./permissions');
const { setUserScopePermission, setUserScopePermissionForFindRequests } = require('./setUserScopePermission');
const convert = require('./convert');

// permissions - Operations
exports.permissions = permissions;

// batchOperations
exports.removeKeyFromList = batchOperations.removeKeyFromList;

// mongoose - Operations
exports.addTypeString = mongoose.addTypeString;

// modifiedResult - Operations
exports.paginate = paginate;
exports.setUserScopePermission = setUserScopePermission;
exports.setUserScopePermissionForFindRequests = setUserScopePermissionForFindRequests;

// params - Operations
exports.prepareParams = params.prepareParams;
exports.modifiedParamsToReturnPatchResponse = params.modifiedParamsToReturnPatchResponse;

// query - Operations
exports.dataToSetQuery = query.dataToSetQuery;
exports.convertSuccessMongoPatchResponse = query.convertSuccessMongoPatchResponse;

// test - Operations
exports.isPaginated = isPaginated;
exports.isfilledArray = (e) => Array.isArray(e) && e.length > 0;

// data and type converting
exports.convertTo = convert;
