/*
 *
 * Google Ad Prototype 2014 - Buffer Loader
 * @author: Joe Harlow
 *
 */

/* Import modules */
var Promise = require('bluebird'); // https://github.com/petkaantonov/bluebird

/*
 *  BufferLoader [constructor] - Create a new BufferLoader instance.
 *  @param {files} - An Array on files to load.
 *  @param {transform} - A function to transform the loader response.
 */
var BufferLoader = function(files, transform) {
    this.files = files;
    this.transform = transform || function(url, res, next) {
        return next(res);
    };
};

/*
 *  BufferLoader.prototype.loadBuffer - Load an individual buffer.
 *  @param {url} - A string of the URL to load.
 *
 *  @return {Promise} - A Promise that resolves when the loader completes.
 */
BufferLoader.prototype.loadBuffer = function(url) {
    var _self = this;

    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'arraybuffer';
        req.onload = function() {
            /* Transform the XHR response */
            _self.transform(url, req.response, function(transformResponse) {
                resolve(transformResponse);
            });
        };
        req.onerror = reject;
        req.send();
    });

};

/*
 *  BufferLoader.prototype.load - Load all the buffers in the file list.
 *
 *  @return {Promise} - A Promise that resolves when the all the loaders complete.
 */
BufferLoader.prototype.load = function() {
    var _self = this;

    var promises = _self.files.map(function(src) {
        return _self.loadBuffer(src);
    });

    return Promise.all(promises);
};

module.exports = BufferLoader;