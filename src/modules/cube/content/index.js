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
var AssetManager = require('../../assetmanager');
var Tracking = require('../../tracking');

var pre = Config.global.isCeltra ? Config.BASE_URL : '';

var content = {
	background: 'assets/img/cubes/{name}/side{i}.jpg', /* Background Image unformatted string */
	html: function(cfg) {
		return '<a href="{link}" class="btn-buy"></a>';
	},
	onload: function(el, cfg) {
		el.querySelector('a[href]').addEventListener('tap', function(e) {
			Tracking.trackEvent('cta-clicked', true);
			Tracking.goToURL(e.target.href);
		});
	},
	music: {
		'_base': 'https://play.google.com/store/music/album/{id}',
		faces: {
			'1': 'Taylor_Swift_1989?id=Bm6l5gvjd6hponuuvzdzk2jwqsm',
			'2': 'Ed_Sheeran_x?id=Bsyd3qgzwutmzucaiknalamq7my',
			'3': 'Sam_Smith_In_The_Lonely_Hour?id=Byxhdoru57rixsex7yk3nav7fu4',
			'4': 'George_Ezra_Wanted_on_Voyage?id=Bxjcdxucqeecxkbgbr4yd5gsywa',
			'5': 'Paloma_Faith_A_Perfect_Contradiction?id=Bjygw5w5l4lrldxjoxf2ltc3vnq'
		}
	},
	movies: {
		'_base': 'https://play.google.com/store/movies/details/{id}',
		faces: {
			'1': 'Guardians_of_the_Galaxy?id=91tu3aA0NVU',
			'2': 'Lucy?id=FWEwXgqUm_w',
			'3': 'Boyhood?id=ZFNvwaFrg4k',
			'4': '22_Jump_Street?id=-Jdc3nidnAg',
			'5': 'The_Equalizer?id=LRW2adieBe0'
		}
	},
	apps: {
		'_base': 'https://play.google.com/store/apps/details?id={id}',
		faces: {
			'1': 'com.runtastic.android.pro2',
			'2': 'com.lightricks.facetune',
			'3': 'com.mojang.minecraftpe',
			'4': 'com.coffeestainstudios.goatsimulator',
			'5': 'com.king.candycrushsodasaga'
		}
	},
	books: {
		'_base': 'https://play.google.com/store/books/details/{id}',
		faces: {
			'1': 'Gillian_Flynn_Gone_Girl?id=hxL2qWMAgv8C',
			'2': 'John_Green_The_Fault_in_Our_Stars?id=Qk8n0olOX5MC',
			'3': 'George_R_R_Martin_A_Game_of_Thrones_A_Song_of_Ice_?id=JPDOSzE7Bo0C',
			'4': 'Veronica_Roth_Divergent_Divergent_Book_1?id=eVHneA77rqEC',
			'5': 'Suzanne_Collins_The_Hunger_Games?id=YhjcAwAAQBAJ'
		}
	}
};

module.exports = content;