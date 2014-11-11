var AudioContext = require('./context');
var BufferLoader = require('./bufferloader');

var context = new AudioContext();

function Sound(url) {

	var buffer, isLoaded = false;

	var loader = new BufferLoader([url], function(buffers) {
		isLoaded = true;
		buffer = buffers.pop();
	});

	loader.load();

	this.play = function() {
		if (!isLoaded) return;
		var source = context.createBufferSource();
		source.buffer = buffer;
		source.onended = function() {
			source = null;
		};
		source.connect(context.destination);
		source.start(0);
	};

}

module.exports = Sound;

