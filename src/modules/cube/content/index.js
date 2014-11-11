var $ = require('../../utilites');
var Config = require('../../config');
var Messaging = require('../../messaging');

var content = {
	background : 'assets/img/{i}.jpg',
	sides : [
		{
			html: function() {
				return (Config.useGif ? '<img class="gif" src="assets/img/tes.gif" width="100%" height="100%" /></span><span>' : '') +
					'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>' +
					'<button>Link out</button>';
			},
			onload: function(el) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.useMessaging) Messaging.post('btn_interaction');
					});

					if (Config.useGif) {
						$('.gif', el).forEach(function(gif) {
							gif.addEventListener('touchmove', $.prevent);
						});
					}
				});
			}
		},
		{
			html: function() {
				return (Config.useVideo ? '<h1>Video</h1><div class="vid"><video src="assets/video/test.mp4" width="100%" height="100%" style="display: none;"></video></div>' : '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod erat et libero porta euismod. Ut mollis velit justo, sodales auctor velit viverra et.</p>' +
					'<button>Click me</button>');
			},
			onload: function(el) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.useMessaging) Messaging.post('btn_interaction');
					});
				});

				if (Config.useVideo) {
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
			html: function() {
				return '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod erat et libero porta euismod. Ut mollis velit justo, sodales auctor velit viverra et.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		},
		{
			html: function() {
				return '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod erat et libero porta euismod. Ut mollis velit justo, sodales auctor velit viverra et.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		},
		{
			html: function() {
				return '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod erat et libero porta euismod. Ut mollis velit justo, sodales auctor velit viverra et.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		},
		{
			html: function() {
				return '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod erat et libero porta euismod. Ut mollis velit justo, sodales auctor velit viverra et.</p>' +
					'<button>Click me</button>';
			},
			onload: function(el) {
				$('button', el).forEach(function(btn) {
					btn.addEventListener('click', function(e) {
						if (Config.useMessaging) Messaging.post('btn_interaction');
					});
				});
			}
		}
	]
};

module.exports = content;