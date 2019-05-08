const assert = require('assert');
const feathers = require('@feathersjs/feathers');

const hooks = require('./information');

const serviceName = 'user/information';

describe('\'user information\' hook', () => {
	let app;

	beforeEach(() => {
		app = feathers();

		app.use(serviceName, {
			async get(data) {
				return data;
			},
		});

		app.service(serviceName).hooks({
			after: {
				get: hooks.after.get,
			},
		});
	});

	it('removeIds from object and nested objects', async () => {
		const data = [
			{
				_id: {
					_bysontype: 'ObjectID',
					id: 'jfalsdfp8a9sdfa3fa3dfasda',
				},
				owner: {
					_bysontype: 'ObjectID',
					id: 'jfalsdfp8a9sdfa3fdfa3dsfasda',
				},
				titel: 'test',
				type: 'lesson',
				sections: [
					{
						_id: {
							_bysontype: 'ObjectID',
							id: 'jfalsdfp8a9sdfa3ffsdfa3dfasda',
						},
						owner: {
							_bysontype: 'ObjectID',
							id: 'jfalsdfp8a9sdsfa3fdfa3dsfasda',
						},
						titel: '',
						type: 'section',
					},
				],
			},
			{
				_id: {
					_bysontype: 'ObjectID',
					id: 'jfalsdfp8a9sddfa3fa3dfasda',
				},
				titel: 'test',
				type: 'lesson',
				sections: [],
			},
		];

		const result = { data };

		try {
			const cleaned = await app.service(serviceName).get(result);

			assert.deepEqual(cleaned, [
				{
					titel: 'test',
					type: 'lesson',
					sections: [
						{
							titel: '',
							type: 'section',
						},
					],
				},
				{
					titel: 'test',
					type: 'lesson',
					sections: [],
				},
			]);
		} catch (e) {
			return e;
		}
	});
});
