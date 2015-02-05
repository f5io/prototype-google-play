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

var pre = Config.global.isCeltra ? Config.BASE_URL : '';

var content = {
	background : 'assets/img/cubes/{name}/side{i}.jpg', /* Background Image unformatted string */
	sides : {
		/* MUSIC */
		music : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			}
		],
		/* BOOKS */
		books : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			}
		],
		/* APPS */
		apps : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			}
		],
		/* MOVIES */
		movies : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<a class="btn-buy"></a>';
				},
				onload: function(el, cfg) {}
			}
		]
	}
};

module.exports = content;