const { BadRequest } = require('@feathersjs/errors');

/**
 * if the hash matches the hash of the section, this function filters any data that is not required by the client
 * (since he already has the most recent version of the section)
 * @param {Object} section a section
 * @param {String} hash string, representing a hash of a version of the section
 */
const filterStateByHash = (section, hash) => {
	const clientAlreadyHasNewestState = hash && hash === section.hash;
	if (clientAlreadyHasNewestState) {
		return {
			_id: section._id,
			permissions: section.permissions,
			title: section.title,
			hash: section.hash,
		};
	}
	return section;
};

/**
 * applies filterStateByHash on an array of sections, using a map of hashes
 * @param {Array} sections an array of sections.
 * @param {stringified JSON} hashes Object with sectionIds as keys, and hashes as values.
 */
const filterManyByHashes = (sections, hashes) => {
	if (hashes) {
		try {
			// eslint-disable-next-line no-param-reassign
			hashes = JSON.parse(hashes);
		} catch (err) {
			throw new BadRequest('hashes should be valid stringified JSON');
		}
		return sections.map((section) => filterStateByHash(section, hashes[section._id.toString()]));
	}
	return sections;
};

module.exports = { filterManyByHashes, filterStateByHash };
