var AudioContext = require('./context');

var context = new AudioContext();

var BufferLoader = function(sources, complete) {
    this.context = context;
    this.sources = sources;
    this.onload = complete;
    this.bufferList = [];
    this.loadCount = 0;
};

BufferLoader.prototype.loadBuffer = function(url, index) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {

        loader.context.decodeAudioData(request.response, function(buffer) {
            loader.bufferList[index] = buffer;

            if (++loader.loadCount == loader.sources.length) {
                this.context = null;
                context = null;
                loader.onload(loader.bufferList);
            }

        }, function(e) {
            console.error('error decoding file data: ' + url);
        });
        
    };

    request.onerror = function() {
        console.error('BufferLoader: XHR error');
    };

    request.send();
};

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.sources.length; ++i) {
        this.loadBuffer(this.sources[i], i);
    }
};

module.exports = BufferLoader;