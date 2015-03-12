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
	music: {
		'_base': 'https://play.google.com/store/music/album/{id}',
		en: {
			'1': 'Taylor_Swift_1989?id=Bm6l5gvjd6hponuuvzdzk2jwqsm',
			'2': 'Ed_Sheeran_x?id=Bsyd3qgzwutmzucaiknalamq7my',
			'3': 'Sam_Smith_In_The_Lonely_Hour?id=Byxhdoru57rixsex7yk3nav7fu4',
			'4': 'George_Ezra_Wanted_on_Voyage?id=Bxjcdxucqeecxkbgbr4yd5gsywa',
			'5': 'Drake_If_You_re_Reading_This_It_s_Too_Late?id=Bihd2cl3xgeonnfg4dnv3ap6a4y'
		},
		de: {
			'1': 'Johannes_Oerding_Alles_brennt?id=Bdj3lfmparotksrv3qpnxunfudu',
			'2': 'Ed_Sheeran_x?id=Bsyd3qgzwutmzucaiknalamq7my',
			'3': 'Kollegah_King?id=Bjszvgpdhtxxf6v7h7pe7n4zgq4',
			'4': 'David_Guetta_Listen_Deluxe?id=Byp6lvzimyf74wxi5634ul4tgam',
			'5': 'Die_Drei_173_D%C3%A4mon_der_Rache?id=Bmgmbvbgjfviwmpm2lgisjshsg4'
		},
		fr: {
			'1': 'Paloma_Faith_A_Perfect_Contradiction_Outsiders_Edi?id=B2ebs67rsfpc3mfvgkwtpkj63ee',
			'2': 'Ed_Sheeran_x_Deluxe_Edition?id=B4juzw6upsachmokmtumqaxqlbu',
			'3': 'Sam_Smith_In_The_Lonely_Hour?id=Byxhdoru57rixsex7yk3nav7fu4',
			'4': 'David_Guetta_Listen_Deluxe?id=Byp6lvzimyf74wxi5634ul4tgam',
			'5': 'Taylor_Swift_1989?id=Bm6l5gvjd6hponuuvzdzk2jwqsm'
		},
		ru: {
			'1': 'IOWA_Export?id=Bjigl73p7fjd2kl2z5l34wp7bkm',
			'2': 'Ed_Sheeran_x?id=Bsyd3qgzwutmzucaiknalamq7my',
			'3': 'Егор_Крид_Самая_самая?id=Bwfkc2eoxn2ttscoqerrpvaxaka',
			'4': 'Наутилус_Помпилиус_Эта_музыка_будет_вечной_Nautilu?id=Bxf5rl5rbke4idfmcywpk7b7smy',
			'5': 'Taylor_Swift_1989?id=Bm6l5gvjd6hponuuvzdzk2jwqsm'
		},
		es: {
			'1': 'Sam_Smith_In_The_Lonely_Hour?id=Byxhdoru57rixsex7yk3nav7fu4&hl=es',
			'2': 'Ed_Sheeran_x?id=Bsyd3qgzwutmzucaiknalamq7my&hl=es',
			'3': 'Miguel_Bose_Amo?id=Boxtqhy5b3lddtrhaquffrpplny&hl=es',
			'4': 'Avicii_The_Nights_Avicii_By_Avicii?id=Blhcdbueiandfbwpmcd22kv4aqq&hl=es',
			'5': 'Taylor_Swift_1989?id=Bm6l5gvjd6hponuuvzdzk2jwqsm&hl=es'
		},
		it: {
			'1': 'J_AX_Il_bello_d_esser_brutti?id=Blkszxfa6ugfqxqqxyhxc37rpdq',
			'2': 'Ed_Sheeran_x?id=Bsyd3qgzwutmzucaiknalamq7my',
			'3': 'Marco_Mengoni_Parole_in_circolo?id=Bokwufzulpbfv3iy24oojz34mce',
			'4': 'David_Guetta_Listen_Deluxe?id=Byp6lvzimyf74wxi5634ul4tgam',
			'5': 'Fedez_Pop_hoolista?id=Bgatalrhsjfc6fxhvhabjxx3sue'
		}
	},
	movies: {
		'_base': 'https://play.google.com/store/movies/details/{id}',
		en: {
			'1': 'Guardians_of_the_Galaxy?id=91tu3aA0NVU',
			'2': 'Lucy?id=FWEwXgqUm_w',
			'3': 'Boyhood?id=ZFNvwaFrg4k',
			'4': '22_Jump_Street?id=-Jdc3nidnAg',
			'5': 'The_Equalizer?id=LRW2adieBe0'
		},
		de: {
			'1': 'Guardians_of_the_Galaxy?id=h-MNAqaXP3I',
			'2': 'Vaterfreuden?id=4mDy1daDhog',
			'3': 'Drachenzähmen_Leicht_Gemacht_2?id=FbQiFkuON-M',
			'4': 'Die_Bestimmung_Divergent?id=5-B8qxjW4rg',
			'5': 'The_Equalizer?id=OV5NLnrkpic'
		},
		fr: {
			'1': 'Frozen?id=wtUc0Ziq5Sw',
			'2': 'La_Grande_Aventure_Lego_2014?id=qP9-R8KRV0Y',
			'3': 'Le_Hobbit_la_Désolation_de_Smaug?id=oVwi8ggajE4',
			'4': 'Lucy?id=X4v4vUHENkc',
			'5': 'Equalizer?id=ibt3kmnqpJU'
		},
		ru: {
			'1': 'Холодное_сердце?id=kcaFXKEhD8c',
			'2': 'Черепашки_ниндзя?id=Tz3muT3BBzE',
			'3': 'Как_приручить_дракона_2?id=8mU89w6c-V0',
			'4': 'Люси?id=jULgDa6sM9E',
			'5': 'Стражи_галактики?id=gTp08yAyUBs'
		},
		es: {
			'1': 'Frozen_El_Reino_del_Hielo?id=zqZFa2FfyEg&hl=es',
			'2': 'La_Lego_Película?id=aphoQqHkAoM&hl=es',
			'3': 'Aviones_Equipo_de_rescate?id=YlJgFmF4H1w&hl=es',
			'4': 'El_Hobbit_La_Desolación_de_Smaug?id=yPU6Do8ql3Y&hl=es',
			'5': 'The_Equalizer_El_Protector_Película_Completa_En_Es?id=1vN4FUwfX0E&hl=es'
		},
		it: {
			'1': 'Frozen?id=HXh2fkhoqJA',
			'2': 'The_Lego_Movie?id=V9lhm7pb8JI',
			'3': 'Planes_Fire_Rescue?id=IvDW2AA2wHw',
			'4': 'The_Grand_Budapest_Hotel?id=u0N7JuD3tYA',
			'5': 'The_Equalizer_Il_vendicatore?id=10fe5iL96R0'
		}
	},
	apps: {
		'_base': 'https://play.google.com/store/apps/details?id={id}',
		en: {
			'1': 'com.runtastic.android.pro2',
			'2': 'com.lightricks.facetune',
			'3': 'com.mojang.minecraftpe',
			'4': 'com.coffeestainstudios.goatsimulator',
			'5': 'com.king.candycrushsodasaga'
		},
		de: {
			'1': 'com.runtastic.android.pro2',
			'2': 'com.hg.devilsfree',
			'3': 'com.flaregames.rrtournament',
			'4': 'com.babbel.mobile.android.en',
			'5': 'com.wunderkinder.wunderlistandroid'
		},
		fr: {
			'1': 'com.runtastic.android.pro2',
			'2': 'com.lightricks.facetune',
			'3': 'com.mojang.minecraftpe',
			'4': 'fr.playsoft.moneydrop',
			'5': 'com.king.candycrushsodasaga'
		},
		ru: {
			'1': 'com.zeptolab.ctr2.f2p.google',
			'2': 'com.nekki.shadowfight',
			'3': 'com.mojang.minecraftpe',
			'4': 'air.net.machinarium.Machinarium.GP',
			'5': 'com.deliveryclub'
		},
		es: {
			'1': 'com.aspyr.swkotor&hl=es',
			'2': 'com.etermax.preguntados.lite&hl=es',
			'3': 'com.mojang.minecraftpe&hl=es',
			'4': 'com.wooga.agentalice&hl=es',
			'5': 'com.king.candycrushsodasaga&hl=es'
		},
		it: {
			'1': 'com.runtastic.android.pro2',
			'2': 'com.ea.game.fifa15_row',
			'3': 'com.mojang.minecraftpe',
			'4': 'com.wooga.agentalice',
			'5': 'com.king.candycrushsodasaga'
		}
	},
	books: {
		'_base': 'https://play.google.com/store/books/details/{id}',
		en: {
			'1': 'Gillian_Flynn_Gone_Girl?id=hxL2qWMAgv8C',
			'2': 'John_Green_The_Fault_in_Our_Stars?id=Qk8n0olOX5MC',
			'3': 'George_R_R_Martin_A_Game_of_Thrones_A_Song_of_Ice_?id=JPDOSzE7Bo0C',
			'4': 'Veronica_Roth_Divergent_Divergent_Book_1?id=eVHneA77rqEC',
			'5': 'Suzanne_Collins_The_Hunger_Games?id=YhjcAwAAQBAJ'
		},
		de: {
			'1': 'Sebastian_Niedlich_Der_Tod_und_andere_Höhepunkte_m?id=tm3HAgAAQBAJ',
			'2': 'Ken_Follett_Der_Schlüssel_zu_Rebecca?id=M0Wu5KoFS7AC',
			'3': 'Sebastian_Fitzek_Passagier_23?id=w5mFAwAAQBAJ',
			'4': 'Charlotte_Link_Sturmzeit?id=qkdZAgAAQBAJ',
			'5': 'Timur_Vermes_Er_ist_wieder_da?id=uy4gWC0XC3kC'
		},
		fr: {
			'1': 'Erroc_Les_Profs_tome_1_interro_surprise?id=McL3Uje7dZcC',
			'2': 'Franquin_Gaston_tome_17_La_saga_des_gaffes?id=f-joPl7Wri0C',
			'3': 'John_Green_Nos_étoiles_contraires?id=nJiUvMO1gFUC',
			'4': 'Maxime_Chattam_Que_ta_volonté_soit_faîte?id=nluPBQAAQBAJ',
			'5': 'George_R_R_Martin_L_Œuf_de_dragon?id=sE60AwAAQBAJ'
		},
		ru: {
			'1': 'Борис_Акунин_Бох_и_Шельма_сборник?id=6EGfBQAAQBAJ',
			'2': 'Булгаков_М_А_Мастер_и_Маргарита?id=vtyZhpB_hFEC',
			'3': 'Братья_Стругацкие_Трудно_быть_богом?id=XDivinQjn4gC',
			'4': 'Семенова_М_Волкодав_Мир_по_дороге?id=_MXpAgAAQBAJ',
			'5': 'Рэй_Брэдбери_451_градус_по_Фаренгейту?id=Vk5XAQAAQBAJ'
		},
		es: {
			'1': 'John_Green_Bajo_la_misma_estrella?id=cvnINtLUcLMC&hl=es',
			'2': 'Dan_Brown_Inferno_versión_española?id=fYPyHRZeX1UC&hl=es',
			'3': 'J_R_R_Tolkien_El_Hobbit?id=xi2URRig7jYC&hl=es',
			'4': 'Ken_Follett_El_umbral_de_la_eternidad_The_Century_?id=3tEQBAAAQBAJ&hl=es',
			'5': 'Javier_Marías_Así_empieza_lo_malo?id=qf_4AwAAQBAJ&hl=es'
		},
		it: {
			'1': 'John_Green_Colpa_delle_stelle?id=wm1BwsNvs1MC',
			'2': 'Chiara_Gamberale_Per_dieci_minuti?id=e08bAgAAQBAJ',
			'3': 'Umberto_Eco_Numero_zero?id=ef7eBQAAQBAJ',
			'4': 'Robert_Galbraith_Il_baco_da_seta?id=TPmFAwAAQBAJ',
			'5': 'Veronica_Roth_Divergent?id=UN2XfMUYyiwC'
		}
	}
};

module.exports = content;