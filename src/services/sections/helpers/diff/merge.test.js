const { expect } = require('chai');
const { mergeDiff } = require('./merge');

describe('merge diff', () => {
	it('should correctly update primitive value', () => {
		const base = { a: 1 };
		const diff = { a: 2 };

		const updated = mergeDiff(base, diff);

		expect(updated).to.deep.equal({ a: 2 });
	});

	it('should correctly unset values', () => {
		const base = { a: 1, b: 2 };
		const diff = { a: null };
		const updated = mergeDiff(base, diff);

		expect(updated).to.deep.equal({ b: 2 });
	});

	it('should correctly change values with different primitive data type', () => {
		const base = { a: 1 };
		const diff = { a: 'hello' };

		const updated = mergeDiff(base, diff);

		expect(updated).to.deep.equal({ a: 'hello' });
	});
});
