const { filterManyByHashes, filterStateByHash } = require('./versionHashes');
const diffToMongo = require('./diffToMongo');

module.exports = { diffToMongo, filterManyByHashes, filterStateByHash };
