/*
 *
 * Google Ad Prototype 2014 - Asset Manager
 * @author: Joe Harlow
 *
 */

/* Import modules */
var BufferLoader = require('./loader');
var ImageAsset = require('./image');
var SoundAsset = require('./sound');

/* Define variables */
var buffers = {},
    imageRegex = /\.(gif|jpeg|jpg|png)$/,
    soundRegex = /\.(mp3|mp4|ogg)$/;

function filterByRegex(regex) {
    return function(asset) {
        return regex.test(asset);
    };
}

function filterAndDefineInBuffersAs(assetType) {
    return function(asset) {
        if (!(asset in buffers)) {
            buffers[asset] = assetType(asset);
            return true;
        } else {
            return false;
        }
    };
}

var AssetManager = {};

AssetManager.load = function(urls) {
    var assets = [],
        sounds, images;
    if (typeof urls === 'string') {
        assets.push(urls);
    } else {
        assets = assets.concat(urls);
    }

    sounds = assets.filter(filterByRegex(soundRegex))
        .filter(filterAndDefineInBuffersAs(SoundAsset));
    images = assets.filter(filterByRegex(imageRegex))
        .filter(filterAndDefineInBuffersAs(ImageAsset));

    var imageLoader = new BufferLoader(images, ImageAsset),
        soundLoader = new BufferLoader(sounds, SoundAsset);

    return Promise.all(
        [
            soundLoader.load(),
            imageLoader.load()
        ]
    ).then(function(response) {
        var snd = response[0],
            img = response[1];

        snd.forEach(function(obj) {
            buffers[obj.source] = obj;
        });

        img.forEach(function(obj) {
            buffers[obj.source] = obj;
        });
    });

};

/*
 *  AssetManager.get - Get an asset from the asset list.
 *
 *  @return {*} - Return the asset from the asset list or undefined.
 */
AssetManager.get = function(url) {
    if (url in buffers) return buffers[url];
};

module.exports = AssetManager;