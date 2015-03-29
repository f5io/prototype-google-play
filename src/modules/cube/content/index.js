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
			apps: '116389570',
			books: '116389246',
			movies: '116389710',
			music: '116389243'
		},
		de: {
			apps: '116428819',
			books: '116429216',
			movies: '116428827',
			music: '116428821'
		},
		fr: {
			apps: '116416012',
			books: '116415809',
			movies: '116416015',
			music: '116415806'
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
				'1': '289365522;{e};r',
				'2': '289365520;{e};p',
				'3': '289365518;{e};w',
				'4': '289365517;{e};v',
				'5': '289365515;{e};t'
			},
			books: {
				'1': '289364270;{e};q',
				'2': '289364273;{e};t',
				'3': '289364272;{e};s',
				'4': '289364266;{e};v',
				'5': '289364267;{e};w'
			},
			movies: {
				'1': '289365523;{e};o',
				'2': '289365521;{e};m',
				'3': '289365519;{e};t',
				'4': '289365533;{e};p',
				'5': '289365531;{e};n'
			},
			music: {
				'1': '289364293;{e};s',
				'2': '289364290;{e};p',
				'3': '289364291;{e};q',
				'4': '289364288;{e};w',
				'5': '289364289;{e};x'
			}
		},
		de: {
			apps: {
				'1': '289418165;{e};t',
				'2': '289418176;{e};v',
				'3': '289418172;{e};r',
				'4': '289418173;{e};s',
				'5': '289418156;{e};t'
			},
			books: {
				'1': '289418116;{e};h',
				'2': '289418109;{e};j',
				'3': '289418111;{e};c',
				'4': '289418117;{e};i',
				'5': '289418119;{e};k'
			},
			movies: {
				'1': '289418169;{e};w',
				'2': '289418100;{e};h',
				'3': '289418104;{e};l',
				'4': '289418177;{e};v',
				'5': '289418160;{e};n'
			},
			music: {
				'1': '289418139;{e};n',
				'2': '289418132;{e};g',
				'3': '289418133;{e};h',
				'4': '289418138;{e};m',
				'5': '289418136;{e};k'
			}
		},
		fr: {
			apps: {
				'1': '289407398;{e};h',
				'2': '289407701;{e};v',
				'3': '289407700;{e};u',
				'4': '289407705;{e};z',
				'5': '289407703;{e};x'
			},
			books: {
				'1': '289407350;{e};i',
				'2': '289407355;{e};n',
				'3': '289407349;{e};q',
				'4': '289407353;{e};l',
				'5': '289407356;{e};o'
			},
			movies: {
				'1': '289407714;{e};c',
				'2': '289407702;{e};z',
				'3': '289407716;{e};e',
				'4': '289407706;{e};d',
				'5': '289407704;{e};b'
			},
			music: {
				'1': '289407372;{e};j',
				'2': '289407374;{e};l',
				'3': '289407371;{e};i',
				'4': '289407376;{e};n',
				'5': '289407373;{e};k'
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
				'1': '289365503;{e};q',
				'2': '289365500;{e};n',
				'3': '289365501;{e};o',
				'4': '289364298;{e};a',
				'5': '289364299;{e};b'
			},
			books: {
				'1': '289364265;{e};u',
				'2': '289364258;{e};w',
				'3': '289364259;{e};x',
				'4': '289364260;{e};p',
				'5': '289364261;{e};q'
			},
			movies: {
				'1': '289365502;{e};l',
				'2': '289365516;{e};q',
				'3': '289365514;{e};o',
				'4': '289365512;{e};m',
				'5': '289365510;{e};k'
			},
			music: {
				'1': '289364284;{e};s',
				'2': '289364279;{e};w',
				'3': '289364278;{e};v',
				'4': '289364281;{e};p',
				'5': '289364280;{e};o'
			}
		},
		de: {
			apps: { /* Ad entry level */
				'1': '289418153;{e};q',
				'2': '289418145;{e};r',
				'3': '289418144;{e};q',
				'4': '289418147;{e};t',
				'5': '289418146;{e};s'
			},
			books: {
				'1': '289418105;{e};f',
				'2': '289418175;{e};m',
				'3': '289418179;{e};q',
				'4': '289418167;{e};n',
				'5': '289418171;{e};i'
			},
			movies: {
				'1': '289418155;{e};r',
				'2': '289418174;{e};s',
				'3': '289418178;{e};w',
				'4': '289418166;{e};t',
				'5': '289418170;{e};o'
			},
			music: {
				'1': '289418129;{e};m',
				'2': '289418126;{e};j',
				'3': '289418127;{e};k',
				'4': '289418124;{e};h',
				'5': '289418125;{e};i'
			}
		},
		fr: {
			apps: { /* Ad entry level */
				'1': '289407386;{e};e',
				'2': '289407383;{e};b',
				'3': '289407384;{e};c',
				'4': '289407382;{e};a',
				'5': '289407381;{e};z'
			},
			books: {
				'1': '289407348;{e};p',
				'2': '289407341;{e};i',
				'3': '289407342;{e};j',
				'4': '289407344;{e};l',
				'5': '289407343;{e};k'
			},
			movies: {
				'1': '289407385;{e};g',
				'2': '289407399;{e};l',
				'3': '289407397;{e};j',
				'4': '289407393;{e};f',
				'5': '289407395;{e};h'
			},
			music: {
				'1': '289407367;{e};n',
				'2': '289407362;{e};i',
				'3': '289407361;{e};h',
				'4': '289407363;{e};j',
				'5': '289407364;{e};k'
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
				'1': '289365532;{e};s',
				'2': '289365530;{e};q',
				'3': '289365528;{e};x',
				'4': '289365526;{e};v',
				'5': '289365524;{e};t'
			},
			books: {
				'1': '289364275;{e};v',
				'2': '289364274;{e};u',
				'3': '289364277;{e};x',
				'4': '289364276;{e};w',
				'5': '289364271;{e};r'
			},
			movies: {
				'1': '289364254;{e};o',
				'2': '289364255;{e};p',
				'3': '289364256;{e};q',
				'4': '289364257;{e};r',
				'5': '289365525;{e};q'
			},
			music: {
				'1': '289364296;{e};v',
				'2': '289364297;{e};w',
				'3': '289364294;{e};t',
				'4': '289364295;{e};u',
				'5': '289364292;{e};r'
			}
		},
		de: {
			apps: { /* Ad entry level */
				'1': '289418106;{e};o',
				'2': '289418102;{e};k',
				'3': '289418114;{e};n',
				'4': '289418110;{e};j',
				'5': '289418148;{e};u'
			},
			books: {
				'1': '289418122;{e};e',
				'2': '289418123;{e};f',
				'3': '289418120;{e};c',
				'4': '289418121;{e};d',
				'5': '289418118;{e};j'
			},
			movies: {
				'1': '289418158;{e};u',
				'2': '289418162;{e};p',
				'3': '289418150;{e};m',
				'4': '289418154;{e};q',
				'5': '289418152;{e};o'
			},
			music: {
				'1': '289418141;{e};g',
				'2': '289418140;{e};f',
				'3': '289418143;{e};i',
				'4': '289418142;{e};h',
				'5': '289418137;{e};l'
			}
		},
		fr: {
			apps: { /* Ad entry level */
				'1': '289407715;{e};a',
				'2': '289407713;{e};y',
				'3': '289407711;{e};w',
				'4': '289407709;{e};d',
				'5': '289407707;{e};b'
			},
			books: {
				'1': '289407358;{e};q',
				'2': '289407357;{e};p',
				'3': '289407360;{e};j',
				'4': '289407359;{e};r',
				'5': '289407354;{e};m'
			},
			movies: {
				'1': '289407337;{e};d',
				'2': '289407338;{e};e',
				'3': '289407339;{e};f',
				'4': '289407340;{e};x',
				'5': '289407708;{e};f'
			},
			music: {
				'1': '289407379;{e};q',
				'2': '289407380;{e};i',
				'3': '289407377;{e};o',
				'4': '289407378;{e};p',
				'5': '289407375;{e};m'
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
				'1': '289365513;{e};r',
				'2': '289365511;{e};p',
				'3': '289365509;{e};w',
				'4': '289365507;{e};u',
				'5': '289365505;{e};s'
			},
			books: {
				'1': '289364268;{e};x',
				'2': '289364269;{e};y',
				'3': '289364262;{e};r',
				'4': '289364263;{e};s',
				'5': '289364264;{e};t'
			},
			movies: {
				'1': '289365529;{e};u',
				'2': '289365527;{e};s',
				'3': '289365508;{e};r',
				'4': '289365506;{e};p',
				'5': '289365504;{e};n'
			},
			music: {
				'1': '289364286;{e};u',
				'2': '289364287;{e};v',
				'3': '289364283;{e};r',
				'4': '289364282;{e};q',
				'5': '289364285;{e};t'
			}
		},
		de: {
			apps: { /* Ad entry level */
				'1': '289418164;{e};s',
				'2': '289418168;{e};w',
				'3': '289418157;{e};u',
				'4': '289418161;{e};p',
				'5': '289418149;{e};v'
			},
			books: {
				'1': '289418115;{e};g',
				'2': '289418113;{e};e',
				'3': '289418103;{e};d',
				'4': '289418101;{e};b',
				'5': '289418107;{e};h'
			},
			movies: {
				'1': '289418112;{e};k',
				'2': '289418108;{e};p',
				'3': '289418159;{e};v',
				'4': '289418163;{e};q',
				'5': '289418151;{e};n'
			},
			music: {
				'1': '289418135;{e};j',
				'2': '289418134;{e};i',
				'3': '289418130;{e};e',
				'4': '289418131;{e};f',
				'5': '289418128;{e};l'
			}
		},
		fr: {
			apps: { /* Ad entry level */
				'1': '289407396;{e};f',
				'2': '289407394;{e};d',
				'3': '289407392;{e};b',
				'4': '289407390;{e};z',
				'5': '289407388;{e};g'
			},
			books: {
				'1': '289407351;{e};j',
				'2': '289407352;{e};k',
				'3': '289407345;{e};m',
				'4': '289407346;{e};n',
				'5': '289407347;{e};o'
			},
			movies: {
				'1': '289407712;{e};a',
				'2': '289407710;{e};y',
				'3': '289407391;{e};d',
				'4': '289407389;{e};k',
				'5': '289407387;{e};i'
			},
			music: {
				'1': '289407369;{e};p',
				'2': '289407370;{e};h',
				'3': '289407366;{e};m',
				'4': '289407365;{e};l',
				'5': '289407368;{e};o'
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