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
	sides : {
		/* MUSIC */
		cube01 : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '<img class="logo" src="assets/img/side-music.jpg"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number music n5">5</span>' +
								'<h1>In the Silence (Deluxe Edition)</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="assets/img/content/covers/music5.jpg" />' +
								'<div class="content-actual music">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Pop</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n4">' +
								'<span class="number music n4">4</span>' +
								'<h1>BBC Music Awards</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="assets/img/content/covers/music4.jpg" />' +
								'<div class="content-actual music">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Pop</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n3">' +
								'<span class="number music n3">3</span>' +
								'<h1>Reclassified</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="assets/img/content/covers/music3.jpg" />' +
								'<div class="content-actual music">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Pop</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n2">' +
								'<span class="number music n2">2</span>' +
								'<h1>III (Deluxe)</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="assets/img/content/covers/music2.jpg" />' +
								'<div class="content-actual music">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Pop</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n1">' +
								'<span class="number music n1">1</span>' +
								'<h1>Bastille vs. Other People\'s Heartache</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="assets/img/content/covers/music1.jpg" />' +
								'<div class="content-actual music">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Alternative</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			}
		],
		/* BOOKS */
		cube02 : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '<img class="logo" src="assets/img/side-books.jpg"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number books n5">5</span>' +
								'<h1>The Fault in Our Stars</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="assets/img/content/covers/book5.jpg" />' +
								'<div class="content-actual books">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>John Green</strong> - 3 May 2010</p>' +
									'<button class="buy">£3.66</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n4">' +
								'<span class="number books n4">4</span>' +
								'<h1>Nikola Tesla: Imagination...</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="assets/img/content/covers/book4.jpg" />' +
								'<div class="content-actual books">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Sean Patrick</strong> - 21 Jun 2014</p>' +
									'<button class="buy">£3.66</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n3">' +
								'<span class="number books n3">3</span>' +
								'<h1>Tell No One</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="assets/img/content/covers/book3.jpg" />' +
								'<div class="content-actual books">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Harlan Coben</strong> - 15 May 2011</p>' +
									'<button class="buy">£3.66</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n2">' +
								'<span class="number books n2">2</span>' +
								'<h1>Where There\'s Smoke</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="assets/img/content/covers/book2.jpg" />' +
								'<div class="content-actual books">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Jodi Picoult</strong> - 20 Nov 2014</p>' +
									'<button class="buy">£3.66</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n1">' +
								'<span class="number books n1">1</span>' +
								'<h1>Christmas at the Cupcake Cafe</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="assets/img/content/covers/book1.jpg" />' +
								'<div class="content-actual books">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Jenny Colgan</strong> - 25 Oct 2012</p>' +
									'<button class="buy">£3.66</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			}
		],
		/* APPS */
		cube03 : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '<img class="logo" src="assets/img/side-apps.jpg"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number apps n5">5</span>' +
								'<h1>Soundcloud - Music and Audio</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="assets/img/content/covers/apps5.png" />' +
								'<div class="content-actual apps">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Music</strong> - 12 May 2012</p>' +
									'<button class="buy">Install</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n4">' +
								'<span class="number apps n4">4</span>' +
								'<h1>Twitter</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="assets/img/content/covers/apps4.png" />' +
								'<div class="content-actual apps">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Communication</strong> - 16 Apr 2014</p>' +
									'<button class="buy">Install</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n3">' +
								'<span class="number apps n3">3</span>' +
								'<h1>Chrome Browser - Google</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="assets/img/content/covers/apps3.png" />' +
								'<div class="content-actual apps">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Communication</strong> - 30 Aug 2009</p>' +
									'<button class="buy">Install</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n2">' +
								'<span class="number apps n2">2</span>' +
								'<h1>Skype</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="assets/img/content/covers/apps2.png" />' +
								'<div class="content-actual apps">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Communication</strong> - 30 Aug 2009</p>' +
									'<button class="buy">Install</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n1">' +
								'<span class="number apps n1">1</span>' +
								'<h1>Instagram</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="assets/img/content/covers/apps1.png" />' +
								'<div class="content-actual apps">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Social</strong> - 3 May 2010</p>' +
									'<button class="buy">Install</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			}
		],
		/* MOVIES */
		cube04 : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '<img class="logo" src="assets/img/side-movies.jpg"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number movies n5">5</span>' +
								'<h1>Gods Pocket</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="assets/img/content/covers/movies5.jpg" />' +
								'<div class="content-actual movies">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Drama</strong> - Oct 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n4">' +
								'<span class="number movies n4">4</span>' +
								'<h1>Dawn of the Planet of the Apes</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="assets/img/content/covers/movies4.jpg" />' +
								'<div class="content-actual movies">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Action</strong> - Sep 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n3">' +
								'<span class="number movies n3">3</span>' +
								'<h1>By the Gun</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="assets/img/content/covers/movies3.jpg" />' +
								'<div class="content-actual movies">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Drama</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n2">' +
								'<span class="number movies n2">2</span>' +
								'<h1>I am Ali</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="assets/img/content/covers/movies2.jpg" />' +
								'<div class="content-actual movies">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Drama</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n1">' +
								'<span class="number movies n1">1</span>' +
								'<h1>The Inbetweeners Movie 2</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="assets/img/content/covers/movies1.jpg" />' +
								'<div class="content-actual movies">' +
									'<p>Lorem ipsum dolor sit et, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore etam dolore magna aliqua.</p>' +
									'<p class="author"><strong>Comedy</strong> - Aug 2014</p>' +
									'<button class="buy">£9.99 Buy</button>' +
									'<div class="stars"></div>' +
								'</div>' +
							'</div>';
				},
				onload: function(el, cfg) {}
			}
		]
	}
};

module.exports = content;