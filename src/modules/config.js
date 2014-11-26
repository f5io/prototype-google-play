/*
 *
 * Google Ad Prototype 2014 - Configuration
 * @author: Joe Harlow
 *
 */

/* General Utilites */
var $ = require('./utilities');

var global = {};

/* Let's define some global configuration options that will emit an event when they are set */
['displayMetrics', 'useSound', 'useAccelerometer', 'useGamification', 'useDynamicLighting', 'useBackgroundAnimation', 'useMessaging'].forEach(function(key) {
	var val = false;
	Object.defineProperty(global, key, {
		enumerable: true,
		set: function(value) {
			val = value;
			$.emitter.emit('global_config_change', key, val);
		},
		get: function() {
			return val;
		}
	});
});

/* Initial global defaults */
global.displayMetrics = false;
global.useSound = true;
global.useGamification = true;
global.useAccelerometer = true;
global.useDynamicLighting = true;

/* Individual cube specific configuration variables */
var cube = {
	useInertia: false,
	useBackgrounds: true,
	useContent: false,
	useVideo: false,
	useGif: false,
	isSequential: false,
	normaliseFacialRotation: false
};

/* Configuration options titles */
var titles = {
	displayMetrics: 'Display Metrics',
	useSound: 'Sound',
	useMessaging: 'Post Messaging',
	useGamification: 'Gamification',
	useDynamicLighting: 'Dynamic Lighting',
	useBackgroundAnimation: 'Background Animation',
	useInertia: 'Inertial Interaction',
	useAccelerometer: 'Accelerometer',
	useBackgrounds: 'Face Backgrounds',
	useContent: 'Face Content',
	useVideo: 'Video Face Content',
	useGif: 'GIF Face Content',
	isSequential: 'Sequential Interaction',
	normaliseFacialRotation: 'Normalise Face Rotation'
};

/* Configuration options descriptions */
var descriptions = {
	displayMetrics: 'Display fps (frames per second) and frame time (in milliseconds).',
	useSound: 'Have sounds throughout the Ad.',
	useMessaging: 'For interaction with Ad Server APIs as an Iframe.',
	useGamification: 'Puzzle comprised of four cubes, match the sides to "win".',
	useDynamicLighting: 'Dynamically light the cubes with a forward facing light.',
	useBackgroundAnimation: 'Turn on a simple background animation for performance testing.',
	useInertia: 'Allow the user to "flick" the cube and it to gradually halt movement.',
	useAccelerometer: 'Turn on rotation from Accelerometer/Gyro data.',
	useBackgrounds: 'Show backgrounds on the cube faces.',
	useContent: 'Show content on the cube faces.',
	useVideo: 'Show a video on one face of the cube.',
	useGif: 'Show a GIF on one face of the cube.',
	isSequential: 'Always display the next face of the cube no matter which way it turns.',
	normaliseFacialRotation: 'Always display cube faces at the correct orientation.'
};

/* Let's expose these objects */
module.exports = {
	global: global,
	cube: cube,
	titles: titles,
	descriptions: descriptions
};