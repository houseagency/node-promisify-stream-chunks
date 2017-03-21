const Transform = require('stream').Transform;

class PromisifyStreamer extends Transform {
	constructor(cb) {
		super({ objectMode: true });
		this.cb = cb;
	}
	_transform(chunk, encoding, cb) {
		this.cb(chunk)
		.then(newchunk => {
			if (typeof newchunk !== 'undefined') {
				cb(null, newchunk);
			} else {
				cb(null, chunk);
			}
		})
		.catch(err => {
			console.error(err);
			cb(null, chunk);
		});
	}
}

module.exports = cb => {
	return new PromisifyStreamer(cb);
};
