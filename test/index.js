const expect = require('chai').expect;
const promisifyStreamChunks = require('../index');
const Readable = require('stream').Readable;
const Writable = require('stream').Writable;

describe('promisify-stream-chunks', () => {

	it('stream chunk should result in callback being called', function(done) {
		const rs = new Readable({ objectMode: true });
		rs.push({ test: 'yo' });
		rs.push(null);

		rs.pipe(promisifyStreamChunks(chunk => {
			return new Promise((resolve, reject) => {
				done();
				resolve();
			});
		}));
	});

	it('streams should still end properly', function(done) {
		const rs = new Readable({ objectMode: true });
		rs.push({ test: 'yo' });
		rs.push(null);

		const stream = rs.pipe(promisifyStreamChunks(chunk => {
			return new Promise((resolve, reject) => {
				resolve();
			});
		}));
		stream.on('finish', done);
	});

	it('callback should not be called before the previous one is resolved', function(done) {
		const rs = new Readable({ objectMode: true });
		rs.push({ test: 'first' });
		rs.push({ test: 'second' });
		rs.push({ test: 'third' });
		rs.push(null);

		let state = 0;
		const stream = rs.pipe(promisifyStreamChunks(chunk => {

			if (state === 0 && chunk.test === 'first') {
				state = 1;
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						expect(state).to.equal(1);
						resolve();
					}, 200);
				});
			}

			if (state === 1 && chunk.test === 'second') {
				state = 2;
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						expect(state).to.equal(2);
						resolve();
					}, 200);
				});
			}

			if (state === 2 && chunk.test === 'third') {
				state = 3;
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						expect(state).to.equal(3);
						state = 4;
						resolve();
					}, 200);
				});
			}

		}));
		stream.on('finish', () => {
			expect(state).to.equal(4);
			done()
		});
	});

	it('should be able to change the chunks', function(done) {
		const rs = new Readable({ objectMode: true });
		rs.push({ test: 'first' });
		rs.push({ test: 'second' });
		rs.push({ test: 'third' });
		rs.push(null);

		const stream = rs.pipe(promisifyStreamChunks(chunk => {
			return new Promise((resolve, reject) => {
				if (chunk.test === 'first') resolve({ test: 'första' });
				if (chunk.test === 'second') resolve({ test: 'andra' });
				if (chunk.test === 'third') resolve({ test: 'tredje' });
			});
		}));

		const content = [];
		stream.pipe(promisifyStreamChunks(chunk => {
			return new Promise((resolve, reject) => {
				content.push(chunk.test);
				resolve();
			});
		})).on('finish', () => {

			expect(content).to.deep.equal([ 'första', 'andra', 'tredje' ]);
			done();

		});


	});

	it('chunks should not change if promise returns no value', function(done) {
		const rs = new Readable({ objectMode: true });
		rs.push({ test: 'first' });
		rs.push({ test: 'second' });
		rs.push({ test: 'third' });
		rs.push(null);

		const stream = rs.pipe(promisifyStreamChunks(chunk => {
			return new Promise((resolve, reject) => {
				resolve();
			});
		}));

		const content = [];
		stream.pipe(promisifyStreamChunks(chunk => {
			return new Promise((resolve, reject) => {
				content.push(chunk.test);
				resolve();
			});
		})).on('finish', () => {

			expect(content).to.deep.equal([ 'first', 'second', 'third' ]);
			done();

		});


	});

});
