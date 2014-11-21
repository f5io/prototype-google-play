/*
 *
 * Google Ad Prototype 2014 - Sound Asset Definition
 * @author: Joe Harlow
 *
 */

/* Import modules */
var AudioContext = require('./context');
var BufferLoader = require('../loader');

var context = new AudioContext();

/*
 *  Sound - Buffer Loader transformation function.
 *  @param {src} - File URL.
 *  @param {res} - XHR ArrayBuffer response.
 *  @param {next} - Function to carry on the Buffer Loader after transformation.
 */
function Sound(src, res, next) {

	var buffer, isLoaded = false;
	var ret = {
		play: function() {
			if (!isLoaded) return;
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.onended = function() {
				source = null;
			};
			source.connect(context.destination);
			source.start(0);
		},
		source: src
	};

	if (res && next) {
		context.decodeAudioData(res, function(buff) {
			buffer = buff;
			isLoaded = true;
			next(ret);
		});
	} else {
		return ret;
	}

}

module.exports = Sound;

