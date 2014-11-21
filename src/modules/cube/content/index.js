/*
 *
 * Google Ad Prototype 2014 - Content Matrix
 * @author: Joe Harlow
 *
 */

/* Import modules */
var $ = require('../../utilities');
var Config = require('../../config');
var Messaging = require('../../messaging');

var content = {
	background : 'assets/img/cubes/{name}/side{i}.jpg', /* Background Image unformatted string */
	sides : [ /* Array of sides with `html` and `onload` functions */
		{
			html: function(cfg) {
				return (cfg.useGif ? '<img class="gif" src="assets/img/tes.gif" width="100%" height="100%" /></span><span>' : '') +
					'<p>Side 1.</p>' +
					'<button>Link out</button>';
			},
			onload: function(el, cfg) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.global.useMessaging) Messaging.post('btn_interaction');
					});

					if (cfg.useGif) {
						$('.gif', el).forEach(function(gif) {
							gif.addEventListener('touchmove', $.prevent);
						});
					}
				});
			}
		},
		{
			html: function(cfg) {
				return (cfg.useVideo ? '<h1>Video</h1><div class="vid"><video src="assets/video/test.mp4" width="100%" height="100%" style="display: none;"></video></div>' : '<p>Side 2.</p>' +
					'<button>Click me</button>');
			},
			onload: function(el, cfg) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.global.useMessaging) Messaging.post('btn_interaction');
					});
				});

				if (cfg.useVideo) {
					$('.vid', el).forEach(function(vid) {
						vid.addEventListener('click', function(e) {
							var video = $('video', vid)[0];
							video.style.display = 'block';
							video.play();
						});
					});
				}
			}
		},
		{
			html: function(cfg) {
				return '<p>Side 3.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el, cfg) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.global.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		},
		{
			html: function(cfg) {
				return '<p>Side 4.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el, cfg) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.global.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		},
		{
			html: function(cfg) {
				return '<p>Side 5.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el, cfg) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.global.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		},
		{
			html: function(cfg) {
				return '<p>Side 6.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el, cfg) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.global.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		}
	]
};

module.exports = content;