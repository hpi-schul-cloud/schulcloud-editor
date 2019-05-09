const assert = require('assert');
const app = require('../../../app');

const serviceName = 'user/information';

describe('\'user information\' service', () => {
	it('registered the service', () => {
		const service = app.service(serviceName);

		assert.ok(service, 'Registered the service');
	});
});
