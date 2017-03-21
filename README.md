promisify-stream-chunks
=======================

All chunks in an object stream are sent to a callback which returns a promise. The next chunk will not be processed before the previous chunk's promise is resolved.

* Works on object streams only.

### How?

	const promisifyStreamChunks = require('promisify-stream-chunks');

	const rs = new Readable({ objectMode: true });
	rs.push({ test: 'first' });
	rs.push({ test: 'second' });
	rs.push({ test: 'third' });
	rs.push(null);

	rs.pipe(promisifyStreamChunks(() => {

		return new Promise((resolve, reject) => {
			doAsyncThings(() => {
				resolve();

				// If you want to transform the values in the stream, do:
				// resolve({ example: 'my data' });
			});

		});

	});

### Roadmap

* We should have a way of handling rejects/errors. Right now, they are only
  outputed to stderr.

