// This file is to add mocha and chai extensions to execute it in tests.
// Every execution of chai use is implicit a global adding for every file after this is execute.
// Also should this execute first.
const chai = require('chai');
const chaiThings = require('chai-things');

// to display with what extensions chai and mocha is execute please add it to this place
// with it + extension name + .use and done call
describe('Add extensions', () => {
	it('chai-things to chai', (done) => {
		chai.use(chaiThings);
		done();
	});
});
