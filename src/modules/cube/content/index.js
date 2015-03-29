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
	background: 'assets/img/cubes/{language}/{name}/side{i}.jpg', /* Background Image unformatted string */
	html: function(cfg) {
		return '<a href="{link}" class="btn-buy"></a>';
	},
	onload: function(el, cfg) {
		el.querySelector('a[href]').addEventListener('tap', function(e) {
			Tracking.trackEvent('cta-clicked', true);
			Tracking.goToURL(e.target.href);
		});
	},
	base: 'https://ad.doubleclick.net/ddm/clk/{id}',
	entryId: {
		en: {
			apps: '116835519',
			books: '116835528',
			movies: '116835336',
			music: '116835329'
		},
		de: {
			apps: '116835923',
			books: '116836107',
			movies: '116835826',
			music: '116825935'
		},
		fr: {
			apps: '116835892',
			books: '116836301',
			movies: '116836083',
			music: '116835895'
		},
		ru: {
			apps: 'XXXXXXXXX',
			books: 'XXXXXXXXX',
			movies: 'XXXXXXXXX',
			music: 'XXXXXXXXX'
		},
		es: {
			apps: 'XXXXXXXXX',
			books: 'XXXXXXXXX',
			movies: 'XXXXXXXXX',
			music: 'XXXXXXXXX'
		},
		it: {
			apps: 'XXXXXXXXX',
			books: 'XXXXXXXXX',
			movies: 'XXXXXXXXX',
			music: 'XXXXXXXXX'
		}
	},
	music: { /* Cube category */
		en: { /* Language */
			apps: { /* Ad entry level */
				'1': '289754683;{e};a', // Taylor Swift
				'2': '289754681;{e};y', // Ed Sheeran
				'3': '289754679;{e};f', // Sam Smith
				'4': '289754678;{e};e', // George Ezra
				'5': '289754676;{e};c'  // Drake
			},
			books: {
				'1': '289754631;{e};t', // Taylor Swift
				'2': '289754634;{e};w', // Ed Sheeran
				'3': '289754633;{e};v', // Sam Smith
				'4': '289754627;{e};y', // George Ezra
				'5': '289754628;{e};z' // Drake
			},
			movies: {
				'1': '289754684;{e};y', // Taylor Swift
				'2': '289754682;{e};w', // Ed Sheeran
				'3': '289754680;{e};u', // Sam Smith
				'4': '289754694;{e};z', // George Ezra
				'5': '289754692;{e};x' // Drake
			},
			music: {
				'1': '289754654;{e};x', // Taylor Swift
				'2': '289754651;{e};u', // Ed Sheeran
				'3': '289754652;{e};v', // Sam Smith
				'4': '289754649;{e};b', // George Ezra
				'5': '289754650;{e};t' // Drake
			}
		},
		de: {
			apps: {
				'1': '289748221;{e};q', // Johannes Oerding
				'2': '289748216;{e};u', // Ed Sheeran
				'3': '289748218;{e};w', // Kollegah King
				'4': '289748219;{e};x', // David Guetta
				'5': '289748223;{e};s' // Die Drei
			},
			books: {
				'1': '289745174;{e};p', // Johannes Oerding
				'2': '289745168;{e};s', // Ed Sheeran
				'3': '289745167;{e};r', // Kollegah King
				'4': '289745173;{e};o', // David Guetta
				'5': '289745171;{e};m' // Die Drei
			},
			movies: {
				'1': '289748222;{e};t', // Johannes Oerding
				'2': '289748232;{e};u', // Ed Sheeran
				'3': '289748234;{e};w', // Kollegah King
				'4': '289748220;{e};r', // David Guetta
				'5': '289748224;{e};v' // Die Drei
			},
			music: {
				'1': '289745191;{e};v', // Johannes Oerding
				'2': '289745190;{e};u', // Ed Sheeran
				'3': '289745189;{e};c', // Kollegah King
				'4': '289745192;{e};w', // David Guetta
				'5': '289745194;{e};y' // Die Drei
			}
		},
		fr: {
			apps: {
				'1': '289755321;{e};u', // Paloma Faith
				'2': '289755324;{e};x', // Ed Sheeran
				'3': '289755323;{e};w', // Sam Smith
				'4': '289755328;{e};b', // David Guetta
				'5': '289755326;{e};z'  // Taylor Swift
			},
			books: {
				'1': '289755173;{e};l', // Paloma Faith
				'2': '289755178;{e};q', // Ed Sheeran
				'3': '289755172;{e};k', // Sam Smith
				'4': '289755176;{e};o', // David Guetta
				'5': '289755179;{e};r' // Taylor Swift
			},
			movies: {
				'1': '289755337;{e};u', // Paloma Faith
				'2': '289755325;{e};r', // Ed Sheeran
				'3': '289755339;{e};w', // Sam Smith
				'4': '289755329;{e};v', // David Guetta
				'5': '289755327;{e};t' // Taylor Swift
			},
			music: {
				'1': '289755195;{e};g', // Paloma Faith
				'2': '289755197;{e};i', // Ed Sheeran
				'3': '289755194;{e};f', // Sam Smith
				'4': '289755199;{e};k', // David Guetta
				'5': '289755196;{e};h' // Taylor Swift
			}
		},
		ru: {
			apps: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		es: {
			apps: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		it: {
			apps: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		}
	},
	movies: { /* Cube category */
		en: { /* Language */
			apps: { /* Ad entry level */
				'1': '289754664;{e};z', // Guardians of the Galaxy
				'2': '289754661;{e};w', // Lucy
				'3': '289754662;{e};x', // Boyhood
				'4': '289754659;{e};d', // 22 Jump Street
				'5': '289754660;{e};v'  // The Equalizer
			},
			books: {
				'1': '289754626;{e};x', // Guardians of the Galaxy
				'2': '289754619;{e};z', // Lucy
				'3': '289754620;{e};r', // Boyhood
				'4': '289754621;{e};s', // 22 Jump Street
				'5': '289754622;{e};t' // The Equalizer
			},
			movies: {
				'1': '289754663;{e};v', // Guardians of the Galaxy
				'2': '289754677;{e};a', // Lucy
				'3': '289754675;{e};y', // Boyhood
				'4': '289754673;{e};w', // 22 Jump Street
				'5': '289754671;{e};u' // The Equalizer
			},
			music: {
				'1': '289754645;{e};x', // Guardians of the Galaxy
				'2': '289754640;{e};s', // Lucy
				'3': '289754639;{e};a', // Boyhood
				'4': '289754642;{e};u', // 22 Jump Street
				'5': '289754641;{e};t' // The Equalizer
			}
		},
		de: {
			apps: { /* Ad entry level */
				'1': '289748204;{e};r', // Guardians of the Galaxy
				'2': '289748201;{e};o', // Vaterfreuden
				'3': '289748202;{e};p', // Drachenzähmen
				'4': '289745199;{e};b', // Die Bestimmung Divergent
				'5': '289748200;{e};n'  // The Equalizer
			},
			books: {
				'1': '289745166;{e};q', // Guardians of the Galaxy
				'2': '289745159;{e};s', // Vaterfreuden
				'3': '289745160;{e};k', // Drachenzähmen
				'4': '289745161;{e};l', // Die Bestimmung Divergent
				'5': '289745162;{e};m' // The Equalizer
			},
			movies: {
				'1': '289748203;{e};s', // Guardians of the Galaxy
				'2': '289748217;{e};x', // Vaterfreuden
				'3': '289748215;{e};v', // Drachenzähmen
				'4': '289748213;{e};t', // Die Bestimmung Divergent
				'5': '289748211;{e};r' // The Equalizer
			},
			music: {
				'1': '289745185;{e};y', // Guardians of the Galaxy
				'2': '289745180;{e};t', // Vaterfreuden
				'3': '289745179;{e};b', // Drachenzähmen
				'4': '289745182;{e};v', // Die Bestimmung Divergent
				'5': '289745181;{e};u' // The Equalizer
			}
		},
		fr: {
			apps: { /* Ad entry level */
				'1': '289755309;{e};a', // Frozen
				'2': '289755306;{e};x', // Lego
				'3': '289755307;{e};y', // Hobbit
				'4': '289755305;{e};w', // Lucy
				'5': '289755304;{e};v'  // Equalizer
			},
			books: {
				'1': '289755171;{e};j', // Frozen
				'2': '289755164;{e};l', // Lego
				'3': '289755165;{e};m', // Hobbit
				'4': '289755167;{e};o', // Lucy
				'5': '289755166;{e};n' // Equalizer
			},
			movies: {
				'1': '289755308;{e};s', // Frozen
				'2': '289755322;{e};o', // Lego
				'3': '289755320;{e};m', // Hobbit
				'4': '289755316;{e};r', // Lucy
				'5': '289755318;{e};t' // Equalizer
			},
			music: {
				'1': '289755190;{e};b', // Frozen
				'2': '289755185;{e};f', // Lego
				'3': '289755184;{e};e', // Hobbit
				'4': '289755186;{e};g', // Lucy
				'5': '289755187;{e};h' // Equalizer
			}
		},
		ru: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		es: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		it: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		}
	},
	apps: { /* Cube category */
		en: { /* Language */
			apps: { /* Ad entry level */
				'1': '289754693;{e};b', // Runtastic
				'2': '289754691;{e};z', // Facetune
				'3': '289754689;{e};g', // Minecraft
				'4': '289754687;{e};e', // Goat Sim
				'5': '289754685;{e};c'  // Candy Crush
			},
			books: {
				'1': '289754636;{e};y', // Runtastic
				'2': '289754635;{e};x', // Facetune
				'3': '289754638;{e};a', // Minecraft
				'4': '289754637;{e};z', // Goat Sim
				'5': '289754632;{e};u' // Candy Crush
			},
			movies: {
				'1': '289754615;{e};s', // Runtastic
				'2': '289754616;{e};t', // Facetune
				'3': '289754617;{e};u', // Minecraft
				'4': '289754618;{e};v', // Goat Sim
				'5': '289754686;{e};a' // Candy Crush
			},
			music: {
				'1': '289754657;{e};a', // Runtastic
				'2': '289754658;{e};b', // Facetune
				'3': '289754655;{e};y', // Minecraft
				'4': '289754656;{e};z', // Goat Sim
				'5': '289754653;{e};w' // Candy Crush
			}
		},
		de: {
			apps: { /* Ad entry level */
				'1': '289748233;{e};t', // Runtastic
				'2': '289748231;{e};r', // Devils Free
				'3': '289748229;{e};y', // RRTournament
				'4': '289748227;{e};w', // Babbel
				'5': '289748225;{e};u'  // Wunderlist
			},
			books: {
				'1': '289745176;{e};r', // Runtastic
				'2': '289745175;{e};q', // Devils Free
				'3': '289745178;{e};t', // RRTournament
				'4': '289745177;{e};s', // Babbel
				'5': '289745172;{e};n' // Wunderlist
			},
			movies: {
				'1': '289745155;{e};v', // Runtastic
				'2': '289745156;{e};w', // Devils Free
				'3': '289745157;{e};x', // RRTournament
				'4': '289745158;{e};y', // Babbel
				'5': '289748226;{e};x' // Wunderlist
			},
			music: {
				'1': '289745197;{e};b', // Runtastic
				'2': '289745198;{e};c', // Devils Free
				'3': '289745195;{e};z', // RRTournament
				'4': '289745196;{e};a', // Babbel
				'5': '289745193;{e};x' // Wunderlist
			}
		},
		fr: {
			apps: { /* Ad entry level */
				'1': '289755338;{e};c', // Runtastic
				'2': '289755336;{e};a', // Facetune
				'3': '289755334;{e};y', // Minecraft
				'4': '289755332;{e};w', // Money Drop
				'5': '289755330;{e};u'  // Candy Crush
			},
			books: {
				'1': '289755181;{e};k', // Runtastic
				'2': '289755180;{e};j', // Facetune
				'3': '289755183;{e};m', // Minecraft
				'4': '289755182;{e};l', // Money Drop
				'5': '289755177;{e};p' // Candy Crush
			},
			movies: {
				'1': '289755160;{e};o', // Runtastic
				'2': '289755161;{e};p', // Facetune
				'3': '289755162;{e};q', // Minecraft
				'4': '289755163;{e};r', // Money Drop
				'5': '289755331;{e};o' // Candy Crush
			},
			music: {
				'1': '289755302;{e};w', // Runtastic
				'2': '289755303;{e};x', // Facetune
				'3': '289755300;{e};u', // Minecraft
				'4': '289755301;{e};v', // Money Drop
				'5': '289755198;{e};j' // Candy Crush
			}
		},
		ru: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		es: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		it: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		}
	},
	books: { /* Cube category */
		en: { /* Language */
			apps: { /* Ad entry level */
				'1': '289754674;{e};a', // Gone Girl
				'2': '289754672;{e};y', // The Fault
				'3': '289754670;{e};w', // Game of Thrones
				'4': '289754668;{e};d', // Divergent
				'5': '289754666;{e};b'  // Hunger Games
			},
			books: {
				'1': '289754629;{e};a', // Gone Girl
				'2': '289754630;{e};s', // The Fault
				'3': '289754623;{e};u', // Game of Thrones
				'4': '289754624;{e};v', // Divergent
				'5': '289754625;{e};w' // Hunger Games
			},
			movies: {
				'1': '289754690;{e};v', // Gone Girl
				'2': '289754688;{e};c', // The Fault
				'3': '289754669;{e};b', // Game of Thrones
				'4': '289754667;{e};z', // Divergent
				'5': '289754665;{e};x' // Hunger Games
			},
			music: {
				'1': '289754647;{e};z', // Gone Girl
				'2': '289754648;{e};a', // The Fault
				'3': '289754644;{e};w', // Game of Thrones
				'4': '289754643;{e};v', // Divergent
				'5': '289754646;{e};y' // Hunger Games
			}
		},
		de: {
			apps: { /* Ad entry level */
				'1': '289748214;{e};s', // Hohepunkte
				'2': '289748212;{e};q', // Follett
				'3': '289748210;{e};o', // Passagier 23
				'4': '289748208;{e};v', // Sturmzeit
				'5': '289748206;{e};t'  // Er is wieder da
			},
			books: {
				'1': '289745169;{e};t', // Hohepunkte
				'2': '289745170;{e};l', // Follett
				'3': '289745163;{e};n', // Passagier 23
				'4': '289745164;{e};o', // Sturmzeit
				'5': '289745165;{e};p' // Er is wieder da
			},
			movies: {
				'1': '289748230;{e};s', // Hohepunkte
				'2': '289748228;{e};z', // Follett
				'3': '289748209;{e};y', // Passagier 23
				'4': '289748207;{e};w', // Sturmzeit
				'5': '289748205;{e};u' // Er is wieder da
			},
			music: {
				'1': '289745187;{e};a', // Hohepunkte
				'2': '289745188;{e};b', // Follett
				'3': '289745184;{e};x', // Passagier 23
				'4': '289745183;{e};w', // Sturmzeit
				'5': '289745186;{e};z' // Er is wieder da
			}
		},
		fr: {
			apps: { /* Ad entry level */
				'1': '289755319;{e};b', // tome 1 interro
				'2': '289755317;{e};z', // Gaston
				'3': '289755315;{e};x', // John Green
				'4': '289755313;{e};v', // Maxime Chattam
				'5': '289755311;{e};t'  // Game of Thrones
			},
			books: {
				'1': '289755174;{e};m', // tome 1 interro
				'2': '289755175;{e};n', // Gaston
				'3': '289755168;{e};p', // John Green
				'4': '289755169;{e};q', // Maxime Chattam
				'5': '289755170;{e};i' // Game of Thrones
			},
			movies: {
				'1': '289755335;{e};s', // tome 1 interro
				'2': '289755333;{e};q', // Gaston
				'3': '289755314;{e};p', // John Green
				'4': '289755312;{e};n', // Maxime Chattam
				'5': '289755310;{e};l' // Game of Thrones
			},
			music: {
				'1': '289755192;{e};d', // tome 1 interro
				'2': '289755193;{e};e', // Gaston
				'3': '289755189;{e};j', // John Green
				'4': '289755188;{e};i', // Maxime Chattam
				'5': '289755191;{e};c' // Game of Thrones
			}
		},
		ru: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		es: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		},
		it: {
			apps: { /* Ad entry level */
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			books: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			movies: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			},
			music: {
				'1': 'XXXXXXXXX;{e};x',
				'2': 'XXXXXXXXX;{e};x',
				'3': 'XXXXXXXXX;{e};x',
				'4': 'XXXXXXXXX;{e};x',
				'5': 'XXXXXXXXX;{e};x'
			}
		}
	}
};

module.exports = content;