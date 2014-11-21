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
var Promise = require('bluebird'); // https://github.com/petkaantonov/bluebird

/* Define variables */
var assets = [],
	buffers = {},
	imageRegex = /\.(gif|jpeg|jpg|png)$/,
	soundRegex = /\.(mp3|ogg)$/;

var sounds, images;

var imageLoader, soundLoader;

/*
 *  organiseAssets [private] - Split the assets array into `Sounds` and `Images`.
 *
 *  @return {AssetManager} - Return Asset Manager for chainability.
 */
function organiseAssets() {

	sounds = assets.filter(function(asset) {
		return soundRegex.test(asset);
	});

	images = assets.filter(function(asset) {
		return imageRegex.test(asset);
	});

	sounds.forEach(function(sound) {
		if (!(sound in buffers)) buffers[sound] = SoundAsset(sound);
	});

	images.forEach(function(image) {
		if (!(image in buffers)) buffers[image] = ImageAsset(image);
	});

	return AssetManager;
}

var AssetManager = {};

/*
 *  AssetManager.add - Add an array or string to the asset list.
 *  @param {urls} - String or Array of assets.
 *
 *  @return {AssetManager} - Return Asset Manager for chainability.
 */
AssetManager.add = function(urls) {
	if (typeof urls === 'string') {
		assets.push(urls);
	} else {
		assets = assets.concat(urls);
	}
	return organiseAssets();
};

/*
 *  AssetManager.preload - Preload all the items in the asset list.
 *
 *  @return {Promise} - A promise that resolves when all assets are loaded.
 */
AssetManager.preload = function() {
	organiseAssets();

	imageLoader = new BufferLoader(images, ImageAsset);
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
	organiseAssets();
	if (url in buffers) return buffers[url];
};

module.exports = AssetManager;