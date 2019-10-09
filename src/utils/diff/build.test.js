const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { connectDb, clearDb, closeDb } = require('../test');
const { SectionModel } = require('../../services/sections/models');

const {
	createSection,
} = require('../fake-data');

const { diffToMongo } = require('./build');

describe('mongo diff tests', () => {
	before(async () => {
		const mongooseConnection = await connectDb();
		this.context = {
			mongooseConnection,
		};
		await clearDb();
	});

	after(async () => {
		await clearDb();
		await closeDb();
	});


	it('should correctly create a mongo diff', async () => {
		const diff = {
			city: {
				districts: { 0: 'Friedrichshain' },
			},
			country: {
				name: 'East Germany',
				year: 1949,
				states: {
					Brandenburg: {
						cities: { 0: 'Potsdam', 'x-pull': ['1'] },
						population: 2500000,
					},
					Pommern: null,
					Saxony: {
						'x-new': true,
						cities: ['Dresden'],
						population: 4500000,
					},
				},
			},
		};

		const mongoDiff = diffToMongo(diff);
		expect(mongoDiff).to.deep.equal({
			$set: {
				'city.districts.0': 'Friedrichshain',
				'country.name': 'East Germany',
				'country.year': 1949,
				'country.states.Brandenburg.cities.0': 'Potsdam',
				'country.states.Brandenburg.cities.1': null,
				'country.states.Brandenburg.population': 2500000,
				'country.states.Saxony': {
					cities: ['Dresden'],
					population: 4500000,
				},
			},
			$pull: {
				'country.states.Brandenburg.cities': null,
			},
			$unset: {
				'country.states.Pommern': '',
			},
		});

		const db = this.context.mongooseConnection.connection.collection('mongo-diff');

		await db.insertOne({
			_id: 1,
			city: {
				name: 'Berlin',
				districts: ['Kreuzberg', 'Neukölln', 'more'],
			},
			country: {
				name: 'Germany',
				year: 1918,
				states: {
					Pommern: {
						borderState: true,
						population: 6000000,
						cities: ['Kolberg'],
					},
					Brandenburg: {
						cities: ['Stettin', 'Potsdam'],
						population: 4000000,
					},
				},
			},
		});

		await db.findOneAndUpdate(
			{ _id: 1 },
			{ $set: mongoDiff.$set, $unset: mongoDiff.$unset },
		);

		const updated = await db.findOneAndUpdate(
			{ _id: 1 },
			{ $pull: mongoDiff.$pull },
			{ returnOriginal: false },
		);

		expect(updated.value).to.deep.equal({
			_id: 1,
			city: {
				name: 'Berlin',
				districts: ['Friedrichshain', 'Neukölln', 'more'],
			},
			country: {
				name: 'East Germany',
				year: 1949,
				states: {
					Saxony: {
						cities: ['Dresden'],
						population: 4500000,
					},
					Brandenburg: {
						cities: ['Potsdam'],
						population: 2500000,
					},
				},
			},
		});
	});

	it('should allow mongo diff to prepend path', () => {
		const diff = {
			city: {
				districts: { 0: 'Friedrichshain' },
			},
		};

		const mongoDiff = diffToMongo(diff, 'some.path');

		expect(mongoDiff).to.deep.equal({
			$set: {
				'some.path.city.districts.0': 'Friedrichshain',
			},
		});
	});

	describe('mongo integration test', () => {
		it('should update a section state', async () => {
			let section = await createSection();
			const baseState = JSON.parse(fs.readFileSync(path.join(__dirname, 'build.test.base.json')).toString());
			section = await SectionModel.findByIdAndUpdate(section._id, {
				state: baseState,
			}, { new: true });

			const diff = JSON.parse(fs.readFileSync(path.join(__dirname, 'build.test.diff.json')).toString());

			const mongoDiff = diffToMongo(diff, 'state');
			const expectedMongoDiff = JSON.parse(fs.readFileSync(path.join(__dirname, 'build.test.mongo.json')).toString());
			expect(mongoDiff).to.deep.equal(expectedMongoDiff);

			const updateObject = {};
			Object.keys(mongoDiff).forEach((key) => {
				if (key !== '$pull') updateObject[key] = mongoDiff[key];
			});
			section = await SectionModel.findByIdAndUpdate(section._id, updateObject, { new: true });

			if (mongoDiff.$pull) {
				section = await SectionModel.findByIdAndUpdate(section._id, {
					$pull: mongoDiff.$pull,
				}, { new: true });
			}

			const updatedState = JSON.parse(fs.readFileSync(path.join(__dirname, 'build.test.updated.json')).toString());
			expect(section.state).to.deep.equal(updatedState);
		});
	});
});
