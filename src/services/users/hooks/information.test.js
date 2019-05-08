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

	it('removeIds from objects 1', async () => {
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

	it('removeIds from objects 2', async () => {
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
				random: 'this is a random value',
				sections: [
					{
						_id: {
							_bysontype: 'ObjectID',
							id: 'jfalsdfpd8a9sdfa3ffsdfa3dfasda',
						},
						owner: {
							_bysontype: 'ObjectID',
							id: 'jfaldsdfp8a9sdsfa3fdfa3dsfasda',
						},
						randomOtherId: { 
							_bysontype: 'ObjectID',
							id: 'jfaldsd33334234fp8a9sdsfa3fdfa3dsfasda',
						},
						titel: 'Nacht und Tag',
						type: 'section',
						random: {
							type: 'ramdom nested value',
							array: [
								'random', 'is', 'the', 'new', 'black',
							],
						},
					},
					{
						_id: {
							_bysontype: 'ObjectID',
							id: 'jfalsdsfp8a9sdfa3ffsdfa3dfasda',
						},
						owner: {
							_bysontype: 'ObjectID',
							id: 'jfalsdfp8a9sdsfa3fdfa3dsfas4da',
						},
						titel: 'tanzen',
						type: 'section',
					},
					{
						_id: {
							_bysontype: 'ObjectID',
							id: 'jfalsdfp8a9sdfa3f23fsdfa3dfasda',
						},
						owner: {
							_bysontype: 'ObjectID',
							id: 'jfalsdfp8a9sdsfa3fd33fa3dsfasda',
						},
						titel: 'Tango',
						type: 'section',
					},
				],
			},
		];

		const result = { data };

		try {
			const cleaned = await app.service(serviceName).get(result);

			assert.deepEqual(cleaned, [
				{
					titel: 'test',
					type: 'lesson',
					random: 'this is a random value',
					sections: [
						{
							titel: 'Nacht und Tag',
							type: 'section',
							random: {
								type: 'ramdom nested value',
								array: [
									'random', 'is', 'the', 'new', 'black',
								],
							},
						},
						{
							titel: 'tanzen',
							type: 'section',
						},
						{
							titel: 'Tango',
							type: 'section',
						},
					],
				},
			]);
		} catch (e) {
			return e;
		}
	});

});
