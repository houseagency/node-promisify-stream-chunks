const Transform = require('stream').Transform;

class PromisifyStreamer extends Transform {
	constructor(cb) {
		super({ objectMode: true });
		this.cb = cb;
	}
	_transform(chunk, encoding, next) {

		this.pause();
		this.cb(chunk)
		.then(newchunk => {
			if (typeof newchunk !== 'undefined') {
				next(null, newchunk);
			} else {
				next(null, chunk);
			}
		})
		.catch(err => {
			console.error(err);
			next(null, chunk);
		})
		.then(() => {
			this.resume();
		});
	}
}

module.exports = cb => {
	return new PromisifyStreamer(cb);
};
