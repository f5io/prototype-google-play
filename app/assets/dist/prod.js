(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014
 * @author: Joe Harlow
 *
 * All code (except libs) (c) Copyright 2014 - Joe Harlow / Essence Digital. Please do not reproduce.
 */

/* General Utilities */
var $ = require('./modules/utilities'); // THIS IS NOT JQUERY

/* Import our modules */
var Config = require('./modules/config');
var Cube = require('./modules/cube');
var Shadow = require('./modules/cube/shadow');
var Orient = require('./modules/orient');
var Messaging = require('./modules/messaging');
var Background = require('./modules/background');
var AssetManager = require('./modules/assetmanager');
var Debug = require('./modules/debug');

/* Import Libraries */
var Stats = require('stats'); // https://github.com/mrdoob/stats.js
var Interpol = require('interpol'); // https://github.com/f5io/interpol.js - Slightly modified, sorry there's no docs.

function init() {

    /* Constants */
    var CUBE_WIDTH = Math.round($.windowWidth() * 0.8), /*250,*/
        HALF_CUBE_WIDTH = CUBE_WIDTH / 2,
        CONTAINER_PERSPECTIVE = (2 * CUBE_WIDTH) + 50;

    /* Cache the views */
    var containerView = $('[role="container"]')[0],
        phoneView = $('[role="phone"]')[0],
        lightView = $('[role="light"]')[0],
        mainView = $('[role="main"]')[0],
        cubeView = $('[role="cube"]')[0],
        menuView = $('[role="menu"]')[0],
        loadView = $('[role="loader"]')[0],
        bgView = $('[role="background"]')[0];

    containerView.style[$.CSS_PERSPECTIVE] = CONTAINER_PERSPECTIVE + 'px';

    var pre = Config.global.isCeltra ? Config.BASE_URL : '';
    
    /* Let's preload all the assets we are going to need */
    AssetManager.add([
        pre + 'assets/img/play-apps.png',
        pre + 'assets/img/play-books.png',
        pre + 'assets/img/play-movies.png',
        pre + 'assets/img/play-music.png',
        pre + 'assets/img/play-bg-apps.jpg',
        pre + 'assets/img/play-bg-books.jpg',
        pre + 'assets/img/play-bg-movies.jpg',
        pre + 'assets/img/play-bg-music.jpg',
        pre + 'assets/img/play-logo-lockup.jpg',
        pre + 'assets/img/side-apps.jpg',
        pre + 'assets/img/side-books.jpg',
        pre + 'assets/img/side-movies.jpg',
        pre + 'assets/img/side-music.jpg',
        pre + 'assets/sound/click.mp3',
        pre + 'assets/img/content/covers/apps1.png',
        pre + 'assets/img/content/covers/apps2.png',
        pre + 'assets/img/content/covers/apps3.png',
        pre + 'assets/img/content/covers/apps4.png',
        pre + 'assets/img/content/covers/apps5.png',
        pre + 'assets/img/content/covers/book1.jpg',
        pre + 'assets/img/content/covers/book2.jpg',
        pre + 'assets/img/content/covers/book3.jpg',
        pre + 'assets/img/content/covers/book4.jpg',
        pre + 'assets/img/content/covers/book5.jpg',
        pre + 'assets/img/content/covers/movies1.jpg',
        pre + 'assets/img/content/covers/movies2.jpg',
        pre + 'assets/img/content/covers/movies3.jpg',
        pre + 'assets/img/content/covers/movies4.jpg',
        pre + 'assets/img/content/covers/movies5.jpg',
        pre + 'assets/img/content/covers/music1.jpg',
        pre + 'assets/img/content/covers/music2.jpg',
        pre + 'assets/img/content/covers/music3.jpg',
        pre + 'assets/img/content/covers/music4.jpg',
        pre + 'assets/img/content/covers/music5.jpg',
        pre + 'assets/img/content/numbers/apps1.png',
        pre + 'assets/img/content/numbers/apps2.png',
        pre + 'assets/img/content/numbers/apps3.png',
        pre + 'assets/img/content/numbers/apps4.png',
        pre + 'assets/img/content/numbers/apps5.png',
        pre + 'assets/img/content/numbers/book1.png',
        pre + 'assets/img/content/numbers/book2.png',
        pre + 'assets/img/content/numbers/book3.png',
        pre + 'assets/img/content/numbers/book4.png',
        pre + 'assets/img/content/numbers/book5.png',
        pre + 'assets/img/content/numbers/movies1.png',
        pre + 'assets/img/content/numbers/movies2.png',
        pre + 'assets/img/content/numbers/movies3.png',
        pre + 'assets/img/content/numbers/movies4.png',
        pre + 'assets/img/content/numbers/movies5.png',
        pre + 'assets/img/content/numbers/music1.png',
        pre + 'assets/img/content/numbers/music2.png',
        pre + 'assets/img/content/numbers/music3.png',
        pre + 'assets/img/content/numbers/music4.png',
        pre + 'assets/img/content/numbers/music5.png',
        pre + 'assets/img/content/stars.png'
    ]).preload().then(function() {

        loadView.className = 'off';

        /* All assets are preloaded */
        var cubes = {}, shadow,
            bigcube, bigrot;
            
        /* Initialise the Debug Panel */
        // Debug.init();

        /* When the debug panel is open prevent pointer events on the main view */
        $.emitter.on('debug_panel', function(isOpen) {
            mainView.classList[isOpen ? 'add' : 'remove']('covered');
        });

        /* Create and initialise the Background Animation */
        var bg = Object.create(Background);
        bg.init(bgView);

        /* Setup Accelerometer orientation listeners */
        // Orient(mainView).listen();

        /* If we are gamifying the ad, load 4 little cubes instead of one big one */
        if (Config.global.useGamification) {
            initialiseFourCubes();
        } else {
            initialiseBigCube();
        }

        /* Define the Menu for the Play Experience here */
        var cubeNames = ['cube01', 'cube02', 'cube03', 'cube04'],
            cubeLabels = ['Music', 'Books', 'Apps', 'Movies & TV'],
            menuItems = [];

        cubeNames.forEach(function(name, i) {
            var el = document.createElement('div');
            var cls = i === 0 ? 'selected ' : '';
            var shortName = cubeLabels[i].toLowerCase().split(' ')[0];
            if (i === 0) {
                document.body.style.background = 'url(' + AssetManager.get(pre + 'assets/img/play-bg-' + shortName + '.jpg').uri() + ') 0 0/cover';
            }
            el.className = cls + shortName;
            el.setAttribute('cube', name);
            el.style.width = (80 / cubeNames.length) - 1.5 + 'vw';
            el.innerText = cubeLabels[i];
            
            el.addEventListener('tap', function(e) {
                if (e.target.classList.contains('selected')) return;
                menuItems.forEach(function(el) {
                    el.classList.remove('selected');
                });
                document.body.style.background = 'url(' + AssetManager.get(pre + 'assets/img/play-bg-' + shortName + '.jpg').uri() + ') 0 0/cover';
                e.target.classList.add('selected');
                bigcube.changeCubeNameChangeInvisibleFacesAndRotate(name);
            });
            
            menuItems.push(el);
            menuView.appendChild(el);
        });


        /* 
         * Subscribe to the `global_config_change` event, if the value of 
         * `useGamification` changes then we swap out the cubes.
         */
        $.emitter.on('global_config_change', function(key, value) {
            if (key === 'useGamification') {
                clearCube();
                if (value) initialiseFourCubes();
                else initialiseBigCube(true);
            }

            // if (key === 'useAccelerometer') {
            //     if (value) Orient.listen();
            //     else Orient.detach();
            // }
        });

        /*
         * Subscribe to the `rotation_complete` event on the gamified 4 cubes,
         * check to see if the currents faces are the same index, then check
         * to see if they all have the same rotation or are normalised.
         */
        $.emitter.on('rotation_complete', function() {

            /* Take the cubes hash map and convert it to a flat array */
            var cbs = Object.keys(cubes).map(function(id) {
                return cubes[id];
            });

            /* Check to see if the cubes have normalised facial rotation */
            var isNormalised = cbs.some(function(cube) {
                return cube.config.normaliseFacialRotation;
            });

            /* Hide the Light view so it doesn't interfere */
            lightView.style.display = 'none';

            /* Get the current visible faces */
            var faces = cbs.map(function(cube, i) {
                var el = cube.element;
                /* Approximate the center of the cube on screen */
                var x = el.offsetLeft + (el.offsetWidth / 2);
                var y = el.offsetTop + (el.offsetHeight / 2);

                /*
                 * Using DOM API get the element from approximated point, then
                 * traverse the tree upwards until we find a `Face`.
                 */
                var face = cube.getFaceFromTarget(document.elementFromPoint(x, y));

                return { face: face, cube: cube };
            });

            /* Show the Light view */
            lightView.style.display = 'block';

            var sameRot = false, sameFaceRot = false;

            /* Check if all current visible faces have the same index */
            sameRot = faces.every(function(c, i, arr) {
                if (i === 0) return true;
                var f1 = arr[i - 1].face, f2 = c.face;
                return f1.index === f2.index;
            });

            /* 
             * If all faces are the same index, and the cube faces are
             * not normalised, check if the faces are the same orientation.
             */
            if (sameRot && !isNormalised) {
                sameFaceRot = faces.every(function(c, i, arr) {
                    var r = c.cube.rotation;
                    var f = c.face.index;

                    /* Get the value of rotation on the Z axis from the normalisation matrix */
                    var rZ = c.cube.getNormalisedFaceRotation(r, f);
                    return rZ === 0;
                });
            }

            /* 
             * If all visible faces have the same index and either all faces are
             * correctly oriented OR the cubes are normalised, set `bigrot` to the
             * current rotation of the first cube and turn off `useGamification` in the config.
             */
            if (sameRot && (sameFaceRot || isNormalised)) {
                bigrot = $.clone(cbs[0].rotation);
                Config.global.useGamification = false;
            }

        });
    
        /*
         * Subscribe to the `fold_out_complete` event on the gamified 4 cubes. After a fold out
         * has happened set `bigrot` to the rotation of the folded out cube and turn
         * off `useGamification` in the config.
         */
        $.emitter.on('fold_out_complete', function(rot) {
            bigrot = $.clone(rot);
            Config.global.useGamification = false;
        });

        /*
         * Subscribe to the `fold_out_start` event on the gamified 4 cubes. As a fold out happens,
         * we animate the opacity of the shadows on the cube beneath.
         */
        $.emitter.on('fold_out_start', function(cubeIndex, duration) {
            var cube = cubes[Object.keys(cubes).filter(function(key) {
                return cubes[key].index === cubeIndex;
            })[0]];

            cube.faces.map(function(face) {
                return $('.shadow', face.element)[0];
            }).forEach(function(face) {
                Interpol.tween()
                    .from(0)
                    .to(1)
                    .duration(duration)
                    .step(function(val) {
                        face.style.opacity = val;
                    })
                    .start();
            });
        });

        /*
         *  initialiseFourCubes - Initialises the gamified ad with 4 cubes
         *  and passes their configs into the Debug panel.
         */
        function initialiseFourCubes() {
            var configs = [];
            for (var i = 0; i < 4; i++) {
                var cubeContainer = $.getElement('div', 'cube-container', {}, {});
                cubeView.appendChild(cubeContainer);
                var cube = Object.create(Cube);
                

                cube.init(HALF_CUBE_WIDTH, HALF_CUBE_WIDTH, i, 'cube0' + (i + 1), cubeContainer, { matchSides: false, castShadow: false });
                cubes[cube.id] = cube;
                cube.element.style.left = $.isOdd(i + 1) ? '-' + HALF_CUBE_WIDTH + 'px' : HALF_CUBE_WIDTH + 'px';
                cube.element.style.top = i < 2 ? '-' + HALF_CUBE_WIDTH + 'px' : HALF_CUBE_WIDTH + 'px';

                // cube.rotation.X = $.getRandomRotation([0, 180]);
                // cube.rotation.Y = $.getRandomRotation([90, 270]);
                // cube.rotation.Z = $.getRandomRotation();

                cube.render();
                if (cube.config.normaliseFacialRotation) cube.getNormalisedFaceRotation(cube.rotation);

                animateCubeIn(cube, i, true);
                configs.push(cube);
            }

            shadow = Object.create(Shadow);
            shadow.init(CUBE_WIDTH, CUBE_WIDTH, 0, 'shadow', cubeView);
            shadow.render();
            animateShadowIn();

            Debug.defineCubeProperties(configs);
        }

        /*
         *  initialiseBigCube - Initialises the single large cube and passes
         *  its config into the Debug panel.
         */
        function initialiseBigCube(fromGame) {
            var cubeContainer = $.getElement('div', 'cube-container', {}, {});
            cubeView.appendChild(cubeContainer);
            bigcube = Object.create(Cube);
            bigcube.init(CUBE_WIDTH, CUBE_WIDTH, 0, 'cube01', cubeContainer, {
                useInertia: false,
                useBackgrounds: false,
                useContent: true,
                isSequential: true,
                normaliseFacialRotation: true
            });
            bigcube.rotation = bigrot || bigcube.rotation;
            bigcube.getNormalisedFaceRotation(bigcube.rotation, true);
            bigcube.render();

            if (!fromGame) animateCubeIn(bigcube, 0);

            Debug.defineCubeProperties([bigcube]);
        }

        /*
         *  clearCube - Clears the cube view and emptys the cube hash map.
         */
        function clearCube() {
            cubeView.innerHTML = '';
            cubes = {};
        }

        /*
         *  animateCubeIn [private] - Animate the cube in from outside of the screen.
         *  @param {cube} - A Cube.
         *  @param {index} - The index of the Cube for sequential animation.
         */
        function animateCubeIn(cube, index, randRot) {
            var container = cube.target,
                numOfRotationsToDo = 3;

            var noop = function() {};

            var tYStart = -$.windowHeight(),
                tYEnd = 0;

            var from, to;

            if (!$.isDefined(randRot)) {
                from = { ty: tYStart, scale: 0 };
                to = { ty: tYEnd, scale: 1 };

                cube.shadow.scale.X = cube.shadow.scale.Y = 0;
                cube.shadow.render();

            } else {
                from = tYStart;
                to = tYEnd;
            }

            container.style[$.CSS_TRANSFORM] += ' translateY(' + tYStart + 'px)';

            Interpol.tween()
                .delay((4 - index) * 200)
                .from(from)
                .to(to)
                .ease(Interpol.easing[index < 2 && $.isDefined(randRot) ? 'easeOutCirc' : 'easeOutBack'])
                .step(function(val) {
                    var ty = 'ty' in val ? val.ty : val;
                    var scale = 'scale' in val ? val.scale : undefined;

                    container.style[$.CSS_TRANSFORM] = container.style[$.CSS_TRANSFORM].replace(/translateY\(.+\)/g, function() {
                        return 'translateY(' + ty + 'px)';
                    });

                    if ($.isDefined(scale)) {
                        cube.shadow.scale.X = cube.shadow.scale.Y = scale;
                        cube.shadow.render();
                    }
                })
                .complete(randRot ? recursiveRotate : noop)
                .start();

            function recursiveRotate() {
                if (--numOfRotationsToDo < 0) return;

                var sV, oldV,
                    useVerticalAxis = $.range(0, 100) < 50 ? true : false,
                    axisDef = cube.getAxisDefinition(cube.rotation),
                    axis = useVerticalAxis ? axisDef.UD : axisDef.LR,
                    delay = numOfRotationsToDo === 2 && (index === 0 || index === 3) ? 0 : 200;

                Interpol.tween()
                    .delay(delay)
                    .duration(300)
                    .from(0)
                    .to(90)
                    .ease(Interpol.easing.easeOutCirc)
                    .step(function(val) {
                        oldV = oldV || val;
                        var nNearest = $.nearest(val, 90);
                        var oNearest = $.nearest(oldV, 90);
                        /* 
                         * If the `nNearest` and `oNearest` do not match, we know the Cube
                         * has passed a 45degree rotation and therefore we should play the sound.
                         */
                        if (nNearest !== oNearest && Config.global.useSound) cube.sound.play();
                        cube.rotation[axis] = sV + val;
                        cube.render();
                        oldV = val;
                    })
                    .complete(function(val) {
                        if (cube.config.normaliseFacialRotation) cube.getNormalisedFaceRotation(cube.rotation);
                        recursiveRotate();
                    })
                    .start(function() {
                        sV = cube.rotation[axis];
                    });
            }
        }

        /*
         *  animateShadowIn [private] - Animate the shadow in from a scale and opacity of 0.
         */
        function animateShadowIn(cube, index) {
            shadow.scale.X = shadow.scale.Y = shadow.opacity = 0;

            var from = 0,
                to = 1;

            Interpol.tween()
                .duration(400)
                .from(from)
                .to(to)
                .ease(Interpol.easing.easeOutBack)
                .step(function(val) {
                    shadow.scale.X = shadow.scale.Y = val;
                    shadow.opacity = val / 10;
                    shadow.render();
                })
                .start();
        }

        /* Let's prevent the horrible over scroll on mobile devices */
        document.addEventListener('touchmove', $.prevent);

    });

}

/* If we are inside Celtra we should have all this guff */
if ($.isDefined(window.screen) && $.isDefined(window.creative)) {
    /* Expose the init function on the window for calling within Celtra */
    Config.global.isCeltra = true;
    window.InitCube = init;
} else {
    /* DOM Ready Event Handler */
    $.ready(init);
}

},{"./modules/assetmanager":41,"./modules/background":45,"./modules/config":46,"./modules/cube":51,"./modules/cube/shadow":53,"./modules/debug":55,"./modules/messaging":56,"./modules/orient":57,"./modules/utilities":58,"interpol":2,"stats":3}],2:[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
(function(factory) {

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(window);
    } else {
        self.Interpol = self.iN = factory(window);
    }

})(function(w) {

    'use strict';

    var _ = {};

    _.fps = 60;

    /*
     *
     *  TERMS OF USE - EASING EQUATIONS
     * 
     *  Open source under the BSD License. 
     *
     *  Copyright © 2001 Robert Penner
     *  All rights reserved.
     *
     *  Redistribution and use in source and binary forms, with or without modification, 
     *  are permitted provided that the following conditions are met:
     *
     *  Redistributions of source code must retain the above copyright notice, this list of 
     *  conditions and the following disclaimer.
     *  Redistributions in binary form must reproduce the above copyright notice, this list 
     *  of conditions and the following disclaimer in the documentation and/or other materials 
     *  provided with the distribution.
     *
     *  Neither the name of the author nor the names of contributors may be used to endorse 
     *  or promote products derived from this software without specific prior written permission.
     *
     *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
     *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
     *  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
     *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
     *  AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
     *  OF THE POSSIBILITY OF SUCH DAMAGE. 
     *
     */

    _.easing = {
        easeNone: function(t, b, c, d) {
            return c * t / d + b;
        },
        easeInQuad: function(t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function(t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOutQuad: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },
        easeInCubic: function(t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },
        easeOutCubic: function(t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOutCubic: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },
        easeInQuart: function(t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
        },
        easeOutQuart: function(t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOutQuart: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },
        easeInQuint: function(t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOutQuint: function(t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },
        easeInSine: function(t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function(t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function(t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },
        easeInExpo: function(t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOutExpo: function(t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOutExpo: function(t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOutCirc: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOutCirc: function(t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },
        easeInElastic: function(t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function(t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function(t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        },
        easeInBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        easeInBounce: function(t, b, c, d) {
            return c - this.easeOutBounce (d-t, 0, c, d) + b;
        },
        easeOutBounce: function(t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOutBounce: function (t, b, c, d) {
            if (t < d/2) return this.easeInBounce (t*2, 0, c, d) * .5 + b;
            return this.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    };

    _.rafLast = 0;

    _.requestAnimFrame = (function(){
        return  w.requestAnimationFrame         ||
                w.webkitRequestAnimationFrame   ||
                w.mozRequestAnimationFrame      ||
                function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - _.rafLast));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
                    _.rafLast = currTime + timeToCall;
                    return id;
                };
    })();

    _.cancelAnimFrame = (function() {
        return  w.cancelAnimationFrame              ||
                w.cancelRequestAnimationFrame       ||
                w.webkitCancelAnimationFrame        ||
                w.webkitCancelRequestAnimationFrame ||
                w.mozCancelAnimationFrame           ||
                w.mozCancelRequestAnimationFrame    ||
                function(id) {
                    clearTimeout(id);
                };
    })();

    _.noop = function() {};
    _.tick = function() {
        var _t = this;
        return function() {
            _t.raf = _.requestAnimFrame.call(w, _.tick.call(_t));
            _t.now = new Date().getTime();
            _t.delta = _t.now - _t.then;
            if (_t.delta > _t.interval) {
                var keys = Object.keys(_t.pipeline);
                var len = keys.length;
                var i = 0;
                for (; i < len; i++) {
                    _t.pipeline[keys[i]]();
                }

                // for (var n in _t.pipeline) {
                //  _t.pipeline[n]();
                // }
                _t.then = _t.now - (_t.delta % _t.interval);
            }
        }
    }

    _.FramePipeline = function() {
        var _t = this;
        _t.pipeline = {};
        _t.then = new Date().getTime();
        _t.now = undefined;
        _t.raf = undefined;
        _t.delta = undefined;
        _t.interval = 1000 / _.fps;
    };

    _.FramePipeline.prototype = {
        add : function(name, fn) {
            this.pipeline[name] = fn;
        },
        remove : function(name) {
            delete this.pipeline[name];
        },
        start : function() {
            _.tick.call(this)();
        },
        has : function(name) {
            return name in this.pipeline;
        },
        pause : function() {
            _.cancelAnimFrame.call(w, this.raf);
        },
        setFPS : function(fps) {
            this.interval = 1000 / fps;
        }
    };

    _.pipeline = new _.FramePipeline();
    _.pipeline.start();


    _.TweenController = function() {
        this.q = [];
    };

    _.TweenController.prototype = {
        queue : function() {
            var nt = new _.Tween(this);
            var pt = this.q[this.q.length - 1];
            if (!pt || pt && pt.hasCompleted) {
                nt.canStart = true;
            } else {
                nt.canStart = false;
                pt.then(function() {
                    nt.canStart = true;
                    nt.start();
                });
            }
            this.q.push(nt);
            return nt;
        }
    }

    _.Tween = function(ctlr) {
        var _t = this;
        _t.name = '$interpol-' + parseInt(Math.random() * new Date().getTime());
        _t.controller = ctlr || new _.TweenController();
        _t.startVal = 0;
        _t.endVal = 0;
        _t.differences = {};
        _t.canStart = true;
        _t.hasStarted = false;
        _t.hasCompleted = false;
        _t.tweenDuration = 400;
        _t.delayDuration = 0;
        _t.isDelayed = false;
        _t.repeatCount = 0;
        _t.paused = false;
        _t.easing = _.easing.easeNone;
        _t.onStep = _.noop;
        _t.onComplete = _.noop;
        _t.onStopped = _.noop
        _t.andThen = _.noop;
    };

    _.Tween.prototype = {
        from : function(val) {
            this.startVal = val;
            return this;
        },
        to : function(val) {
            this.endVal = val;
            return this;
        },
        duration : function(ms) {
            this.tweenDuration = ms;
            return this;
        },
        delay : function(ms) {
            this.delayDuration = ms;
            return this;
        },
        repeat : function(count) {
            this.repeatCount = count;
            return this;
        },
        ease : function(fn) {
            this.easing = fn;
            return this;
        },
        step : function(fn) {
            this.onStep = fn;
            return this;
        },
        complete : function(fn) {
            this.onComplete = fn;
            return this;
        },
        stopped : function(fn) {
            this.onStopped = fn;
            return this;
        },
        then : function(fn) {
            this.andThen = fn;
            return this;
        },
        reverse : function() {
            var sV = this.startVal,
                eV = this.endVal;

            this.startVal = eV;
            this.endVal = sV;
            this.start();
        },
        start : function(fn) {
            var _t = this;
            if (!_t.canStart) return _t;
            if (_t.delayDuration > 0 && !_t.isDelayed) {
                setTimeout(function() {
                    _t.start(fn);
                }, _t.delayDuration);
                _t.isDelayed = true;
                return _t;
            }

            if (fn) fn.apply(_t);

            var stepDuration = 1000 / _.fps,
                steps = _t.tweenDuration / stepDuration;

            if (typeof _t.endVal === 'object') {
                if (typeof _t.startVal !== 'object') {
                    _t.startVal = {};
                }
                for (var val in _t.endVal) {
                    if (!_t.startVal.hasOwnProperty(val)) {
                        _t.startVal[val] = 0;
                    }
                    _t.differences[val] = _t.endVal[val] - _t.startVal[val];
                }
            } else {
                _t.differences['$itp-main'] = _t.endVal - _t.startVal;
            }

            _t.hasStarted = true;
            _t.stpFn = function() {
                if (steps >= 0 && _t.hasStarted) {
                    var s = _t.tweenDuration;
                    s = s - (steps * stepDuration);
                    steps--;
                    var vals = _t.differences.hasOwnProperty('$itp-main') ? _t.easing.call(_.easing, s, _t.startVal, _t.differences['$itp-main'], _t.tweenDuration) : {};
                    if (typeof vals === 'object') {
                        for (var v in _t.differences) {
                            vals[v] = _t.easing.call(_.easing, s, _t.startVal[v], _t.differences[v], _t.tweenDuration);
                        }
                    }
                    _t.onStep.call(_t, vals);
                } else if (!_t.hasStarted) {
                    _.pipeline.remove(_t.name);
                    _t.onStopped.call(_t);
                } else {
                    _.pipeline.remove(_t.name);
                    _t.hasStarted = false;
                    _t.isDelayed = false;
                    if (_t.repeatCount > 0 || _t.repeatCount === -1 || _t.repeatCount === Infinity) {
                        _t.repeatCount = _t.repeatCount < 0 || _t.repeatCount === Infinity ? _t.repeatCount : _t.repeatCount--;
                        _t.onComplete.call(_t, _t.endVal);
                        _t.start();
                    } else {
                        _t.hasCompleted = true;
                        _t.onComplete.call(_t, _t.endVal);
                        _t.andThen.call(_t);
                        _t.controller.q.shift();
                    }
                }
            };
            _.pipeline.add(_t.name, _t.stpFn);
            return _t;
        },
        stop : function() {
            this.hasStarted = false;
            return this;
        },
        pause : function() {
            _.pipeline.remove(this.name);
            return this;
        },
        play : function() {
            if (_.pipeline.has(this.name)) return;
            _.pipeline.add(this.name, this.stpFn);
            return this;
        },
        queue : function() {
            return this.controller.queue();
        }
    }

    var _iN = function(fps) {
        _.fps = fps;
        _.pipeline.setFPS(_.fps);
        return _iN;
    };

    _iN.easing = _.easing;
    _iN.tween = function() {
        return new _.Tween();
    };
    _iN.queue = function() {
        return new _.TweenController().queue();
    };

    _iN.pipeline = _.pipeline;

    return _iN;

});
; browserify_shim__define__module__export__(typeof Interpol != "undefined" ? Interpol : window.Interpol);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement( 'div' );
	container.id = 'stats';
	container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
	container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

	var fpsDiv = document.createElement( 'div' );
	fpsDiv.id = 'fps';
	fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
	container.appendChild( fpsDiv );

	var fpsText = document.createElement( 'div' );
	fpsText.id = 'fpsText';
	fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild( fpsText );

	var fpsGraph = document.createElement( 'div' );
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
	fpsDiv.appendChild( fpsGraph );

	while ( fpsGraph.children.length < 74 ) {

		var bar = document.createElement( 'span' );
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
		fpsGraph.appendChild( bar );

	}

	var msDiv = document.createElement( 'div' );
	msDiv.id = 'ms';
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
	container.appendChild( msDiv );

	var msText = document.createElement( 'div' );
	msText.id = 'msText';
	msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML = 'MS';
	msDiv.appendChild( msText );

	var msGraph = document.createElement( 'div' );
	msGraph.id = 'msGraph';
	msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
	msDiv.appendChild( msGraph );

	while ( msGraph.children.length < 74 ) {

		var bar = document.createElement( 'span' );
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
		msGraph.appendChild( bar );

	}

	var setMode = function ( value ) {

		mode = value;

		switch ( mode ) {

			case 0:
				fpsDiv.style.display = 'block';
				msDiv.style.display = 'none';
				break;
			case 1:
				fpsDiv.style.display = 'none';
				msDiv.style.display = 'block';
				break;
		}

	}

	var updateGraph = function ( dom, value ) {

		var child = dom.appendChild( dom.firstChild );
		child.style.height = value + 'px';

	}

	return {

		REVISION: 11,

		domElement: container,

		setMode: setMode,

		begin: function () {

			startTime = Date.now();

		},

		end: function () {

			var time = Date.now();

			ms = time - startTime;
			msMin = Math.min( msMin, ms );
			msMax = Math.max( msMax, ms );

			msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
			updateGraph( msGraph, Math.min( 30, 30 - ( ms / 200 ) * 30 ) );

			frames ++;

			if ( time > prevTime + 1000 ) {

				fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
				fpsMin = Math.min( fpsMin, fps );
				fpsMax = Math.max( fpsMax, fps );

				fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
				updateGraph( fpsGraph, Math.min( 30, 30 - ( fps / 100 ) * 30 ) );

				prevTime = time;
				frames = 0;

			}

			return time;

		},

		update: function () {

			startTime = this.end();

		}

	}

};
; browserify_shim__define__module__export__(typeof Stats != "undefined" ? Stats : window.Stats);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
var SomePromiseArray = Promise._SomePromiseArray;
function Promise$_Any(promises) {
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    if (promise.isRejected()) {
        return promise;
    }
    ret.setHowMany(1);
    ret.setUnwrap();
    ret.init();
    return promise;
}

Promise.any = function Promise$Any(promises) {
    return Promise$_Any(promises);
};

Promise.prototype.any = function Promise$any() {
    return Promise$_Any(this);
};

};

},{}],5:[function(require,module,exports){
(function (process){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var schedule = require("./schedule.js");
var Queue = require("./queue.js");
var errorObj = require("./util.js").errorObj;
var tryCatch1 = require("./util.js").tryCatch1;
var _process = typeof process !== "undefined" ? process : void 0;

function Async() {
    this._isTickUsed = false;
    this._schedule = schedule;
    this._length = 0;
    this._lateBuffer = new Queue(16);
    this._functionBuffer = new Queue(65536);
    var self = this;
    this.consumeFunctionBuffer = function Async$consumeFunctionBuffer() {
        self._consumeFunctionBuffer();
    };
}

Async.prototype.haveItemsQueued = function Async$haveItemsQueued() {
    return this._length > 0;
};

Async.prototype.invokeLater = function Async$invokeLater(fn, receiver, arg) {
    if (_process !== void 0 &&
        _process.domain != null &&
        !fn.domain) {
        fn = _process.domain.bind(fn);
    }
    this._lateBuffer.push(fn, receiver, arg);
    this._queueTick();
};

Async.prototype.invoke = function Async$invoke(fn, receiver, arg) {
    if (_process !== void 0 &&
        _process.domain != null &&
        !fn.domain) {
        fn = _process.domain.bind(fn);
    }
    var functionBuffer = this._functionBuffer;
    functionBuffer.push(fn, receiver, arg);
    this._length = functionBuffer.length();
    this._queueTick();
};

Async.prototype._consumeFunctionBuffer =
function Async$_consumeFunctionBuffer() {
    var functionBuffer = this._functionBuffer;
    while (functionBuffer.length() > 0) {
        var fn = functionBuffer.shift();
        var receiver = functionBuffer.shift();
        var arg = functionBuffer.shift();
        fn.call(receiver, arg);
    }
    this._reset();
    this._consumeLateBuffer();
};

Async.prototype._consumeLateBuffer = function Async$_consumeLateBuffer() {
    var buffer = this._lateBuffer;
    while(buffer.length() > 0) {
        var fn = buffer.shift();
        var receiver = buffer.shift();
        var arg = buffer.shift();
        var res = tryCatch1(fn, receiver, arg);
        if (res === errorObj) {
            this._queueTick();
            if (fn.domain != null) {
                fn.domain.emit("error", res.e);
            } else {
                throw res.e;
            }
        }
    }
};

Async.prototype._queueTick = function Async$_queue() {
    if (!this._isTickUsed) {
        this._schedule(this.consumeFunctionBuffer);
        this._isTickUsed = true;
    }
};

Async.prototype._reset = function Async$_reset() {
    this._isTickUsed = false;
    this._length = 0;
};

module.exports = new Async();

}).call(this,require('_process'))
},{"./queue.js":28,"./schedule.js":31,"./util.js":38,"_process":39}],6:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var Promise = require("./promise.js")();
module.exports = Promise;
},{"./promise.js":23}],7:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var cr = Object.create;
if (cr) {
    var callerCache = cr(null);
    var getterCache = cr(null);
    callerCache[" size"] = getterCache[" size"] = 0;
}

module.exports = function(Promise) {
var util = require("./util.js");
var canEvaluate = util.canEvaluate;
var isIdentifier = util.isIdentifier;

function makeMethodCaller (methodName) {
    return new Function("obj", "                                             \n\
        'use strict'                                                         \n\
        var len = this.length;                                               \n\
        switch(len) {                                                        \n\
            case 1: return obj.methodName(this[0]);                          \n\
            case 2: return obj.methodName(this[0], this[1]);                 \n\
            case 3: return obj.methodName(this[0], this[1], this[2]);        \n\
            case 0: return obj.methodName();                                 \n\
            default: return obj.methodName.apply(obj, this);                 \n\
        }                                                                    \n\
        ".replace(/methodName/g, methodName));
}

function makeGetter (propertyName) {
    return new Function("obj", "                                             \n\
        'use strict';                                                        \n\
        return obj.propertyName;                                             \n\
        ".replace("propertyName", propertyName));
}

function getCompiled(name, compiler, cache) {
    var ret = cache[name];
    if (typeof ret !== "function") {
        if (!isIdentifier(name)) {
            return null;
        }
        ret = compiler(name);
        cache[name] = ret;
        cache[" size"]++;
        if (cache[" size"] > 512) {
            var keys = Object.keys(cache);
            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
            cache[" size"] = keys.length - 256;
        }
    }
    return ret;
}

function getMethodCaller(name) {
    return getCompiled(name, makeMethodCaller, callerCache);
}

function getGetter(name) {
    return getCompiled(name, makeGetter, getterCache);
}

function caller(obj) {
    return obj[this.pop()].apply(obj, this);
}
Promise.prototype.call = function Promise$call(methodName) {
    var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
    if (canEvaluate) {
        var maybeCaller = getMethodCaller(methodName);
        if (maybeCaller !== null) {
            return this._then(maybeCaller, void 0, void 0, args, void 0);
        }
    }
    args.push(methodName);
    return this._then(caller, void 0, void 0, args, void 0);
};

function namedGetter(obj) {
    return obj[this];
}
function indexedGetter(obj) {
    return obj[this];
}
Promise.prototype.get = function Promise$get(propertyName) {
    var isIndex = (typeof propertyName === "number");
    var getter;
    if (!isIndex) {
        if (canEvaluate) {
            var maybeGetter = getGetter(propertyName);
            getter = maybeGetter !== null ? maybeGetter : namedGetter;
        } else {
            getter = namedGetter;
        }
    } else {
        getter = indexedGetter;
    }
    return this._then(getter, void 0, void 0, propertyName, void 0);
};
};

},{"./util.js":38}],8:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var errors = require("./errors.js");
var canAttach = errors.canAttach;
var async = require("./async.js");
var CancellationError = errors.CancellationError;

Promise.prototype._cancel = function Promise$_cancel(reason) {
    if (!this.isCancellable()) return this;
    var parent;
    var promiseToReject = this;
    while ((parent = promiseToReject._cancellationParent) !== void 0 &&
        parent.isCancellable()) {
        promiseToReject = parent;
    }
    this._unsetCancellable();
    promiseToReject._attachExtraTrace(reason);
    promiseToReject._rejectUnchecked(reason);
};

Promise.prototype.cancel = function Promise$cancel(reason) {
    if (!this.isCancellable()) return this;
    reason = reason !== void 0
        ? (canAttach(reason) ? reason : new Error(reason + ""))
        : new CancellationError();
    async.invokeLater(this._cancel, this, reason);
    return this;
};

Promise.prototype.cancellable = function Promise$cancellable() {
    if (this._cancellable()) return this;
    this._setCancellable();
    this._cancellationParent = void 0;
    return this;
};

Promise.prototype.uncancellable = function Promise$uncancellable() {
    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 2 | 4);
    ret._follow(this);
    ret._unsetCancellable();
    return ret;
};

Promise.prototype.fork =
function Promise$fork(didFulfill, didReject, didProgress) {
    var ret = this._then(didFulfill, didReject, didProgress,
                         void 0, void 0);

    ret._setCancellable();
    ret._cancellationParent = void 0;
    return ret;
};
};

},{"./async.js":5,"./errors.js":13}],9:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function() {
var inherits = require("./util.js").inherits;
var defineProperty = require("./es5.js").defineProperty;

var rignore = new RegExp(
    "\\b(?:[a-zA-Z0-9.]+\\$_\\w+|" +
    "tryCatch(?:1|2|3|4|Apply)|new \\w*PromiseArray|" +
    "\\w*PromiseArray\\.\\w*PromiseArray|" +
    "setTimeout|CatchFilter\\$_\\w+|makeNodePromisified|processImmediate|" +
    "process._tickCallback|nextTick|Async\\$\\w+)\\b"
);

var rtraceline = null;
var formatStack = null;

function formatNonError(obj) {
    var str;
    if (typeof obj === "function") {
        str = "[function " +
            (obj.name || "anonymous") +
            "]";
    } else {
        str = obj.toString();
        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
        if (ruselessToString.test(str)) {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch(e) {

            }
        }
        if (str.length === 0) {
            str = "(empty array)";
        }
    }
    return ("(<" + snip(str) + ">, no stack trace)");
}

function snip(str) {
    var maxChars = 41;
    if (str.length < maxChars) {
        return str;
    }
    return str.substr(0, maxChars - 3) + "...";
}

function CapturedTrace(ignoreUntil, isTopLevel) {
    this.captureStackTrace(CapturedTrace, isTopLevel);

}
inherits(CapturedTrace, Error);

CapturedTrace.prototype.captureStackTrace =
function CapturedTrace$captureStackTrace(ignoreUntil, isTopLevel) {
    captureStackTrace(this, ignoreUntil, isTopLevel);
};

CapturedTrace.possiblyUnhandledRejection =
function CapturedTrace$PossiblyUnhandledRejection(reason) {
    if (typeof console === "object") {
        var message;
        if (typeof reason === "object" || typeof reason === "function") {
            var stack = reason.stack;
            message = "Possibly unhandled " + formatStack(stack, reason);
        } else {
            message = "Possibly unhandled " + String(reason);
        }
        if (typeof console.error === "function" ||
            typeof console.error === "object") {
            console.error(message);
        } else if (typeof console.log === "function" ||
            typeof console.log === "object") {
            console.log(message);
        }
    }
};

CapturedTrace.combine = function CapturedTrace$Combine(current, prev) {
    var currentLastIndex = current.length - 1;
    var currentLastLine = current[currentLastIndex];
    var commonRootMeetPoint = -1;
    for (var i = prev.length - 1; i >= 0; --i) {
        if (prev[i] === currentLastLine) {
            commonRootMeetPoint = i;
            break;
        }
    }

    for (var i = commonRootMeetPoint; i >= 0; --i) {
        var line = prev[i];
        if (current[currentLastIndex] === line) {
            current.pop();
            currentLastIndex--;
        } else {
            break;
        }
    }

    current.push("From previous event:");
    var lines = current.concat(prev);

    var ret = [];

    for (var i = 0, len = lines.length; i < len; ++i) {

        if (((rignore.test(lines[i]) && rtraceline.test(lines[i])) ||
            (i > 0 && !rtraceline.test(lines[i])) &&
            lines[i] !== "From previous event:")
       ) {
            continue;
        }
        ret.push(lines[i]);
    }
    return ret;
};

CapturedTrace.protectErrorMessageNewlines = function(stack) {
    for (var i = 0; i < stack.length; ++i) {
        if (rtraceline.test(stack[i])) {
            break;
        }
    }

    if (i <= 1) return;

    var errorMessageLines = [];
    for (var j = 0; j < i; ++j) {
        errorMessageLines.push(stack.shift());
    }
    stack.unshift(errorMessageLines.join("\u0002\u0000\u0001"));
};

CapturedTrace.isSupported = function CapturedTrace$IsSupported() {
    return typeof captureStackTrace === "function";
};

var captureStackTrace = (function stackDetection() {
    if (typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function") {
        rtraceline = /^\s*at\s*/;
        formatStack = function(stack, error) {
            if (typeof stack === "string") return stack;

            if (error.name !== void 0 &&
                error.message !== void 0) {
                return error.name + ". " + error.message;
            }
            return formatNonError(error);


        };
        var captureStackTrace = Error.captureStackTrace;
        return function CapturedTrace$_captureStackTrace(
            receiver, ignoreUntil) {
            captureStackTrace(receiver, ignoreUntil);
        };
    }
    var err = new Error();

    if (typeof err.stack === "string" &&
        typeof "".startsWith === "function" &&
        (err.stack.startsWith("stackDetection@")) &&
        stackDetection.name === "stackDetection") {

        defineProperty(Error, "stackTraceLimit", {
            writable: true,
            enumerable: false,
            configurable: false,
            value: 25
        });
        rtraceline = /@/;
        var rline = /[@\n]/;

        formatStack = function(stack, error) {
            if (typeof stack === "string") {
                return (error.name + ". " + error.message + "\n" + stack);
            }

            if (error.name !== void 0 &&
                error.message !== void 0) {
                return error.name + ". " + error.message;
            }
            return formatNonError(error);
        };

        return function captureStackTrace(o) {
            var stack = new Error().stack;
            var split = stack.split(rline);
            var len = split.length;
            var ret = "";
            for (var i = 0; i < len; i += 2) {
                ret += split[i];
                ret += "@";
                ret += split[i + 1];
                ret += "\n";
            }
            o.stack = ret;
        };
    } else {
        formatStack = function(stack, error) {
            if (typeof stack === "string") return stack;

            if ((typeof error === "object" ||
                typeof error === "function") &&
                error.name !== void 0 &&
                error.message !== void 0) {
                return error.name + ". " + error.message;
            }
            return formatNonError(error);
        };

        return null;
    }
})();

return CapturedTrace;
};

},{"./es5.js":15,"./util.js":38}],10:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(NEXT_FILTER) {
var util = require("./util.js");
var errors = require("./errors.js");
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;
var keys = require("./es5.js").keys;
var TypeError = errors.TypeError;

function CatchFilter(instances, callback, promise) {
    this._instances = instances;
    this._callback = callback;
    this._promise = promise;
}

function CatchFilter$_safePredicate(predicate, e) {
    var safeObject = {};
    var retfilter = tryCatch1(predicate, safeObject, e);

    if (retfilter === errorObj) return retfilter;

    var safeKeys = keys(safeObject);
    if (safeKeys.length) {
        errorObj.e = new TypeError(
            "Catch filter must inherit from Error "
          + "or be a simple predicate function");
        return errorObj;
    }
    return retfilter;
}

CatchFilter.prototype.doFilter = function CatchFilter$_doFilter(e) {
    var cb = this._callback;
    var promise = this._promise;
    var boundTo = promise._boundTo;
    for (var i = 0, len = this._instances.length; i < len; ++i) {
        var item = this._instances[i];
        var itemIsErrorType = item === Error ||
            (item != null && item.prototype instanceof Error);

        if (itemIsErrorType && e instanceof item) {
            var ret = tryCatch1(cb, boundTo, e);
            if (ret === errorObj) {
                NEXT_FILTER.e = ret.e;
                return NEXT_FILTER;
            }
            return ret;
        } else if (typeof item === "function" && !itemIsErrorType) {
            var shouldHandle = CatchFilter$_safePredicate(item, e);
            if (shouldHandle === errorObj) {
                var trace = errors.canAttach(errorObj.e)
                    ? errorObj.e
                    : new Error(errorObj.e + "");
                this._promise._attachExtraTrace(trace);
                e = errorObj.e;
                break;
            } else if (shouldHandle) {
                var ret = tryCatch1(cb, boundTo, e);
                if (ret === errorObj) {
                    NEXT_FILTER.e = ret.e;
                    return NEXT_FILTER;
                }
                return ret;
            }
        }
    }
    NEXT_FILTER.e = e;
    return NEXT_FILTER;
};

return CatchFilter;
};

},{"./errors.js":13,"./es5.js":15,"./util.js":38}],11:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var util = require("./util.js");
var isPrimitive = util.isPrimitive;
var wrapsPrimitiveReceiver = util.wrapsPrimitiveReceiver;

module.exports = function(Promise) {
var returner = function Promise$_returner() {
    return this;
};
var thrower = function Promise$_thrower() {
    throw this;
};

var wrapper = function Promise$_wrapper(value, action) {
    if (action === 1) {
        return function Promise$_thrower() {
            throw value;
        };
    } else if (action === 2) {
        return function Promise$_returner() {
            return value;
        };
    }
};


Promise.prototype["return"] =
Promise.prototype.thenReturn =
function Promise$thenReturn(value) {
    if (wrapsPrimitiveReceiver && isPrimitive(value)) {
        return this._then(
            wrapper(value, 2),
            void 0,
            void 0,
            void 0,
            void 0
       );
    }
    return this._then(returner, void 0, void 0, value, void 0);
};

Promise.prototype["throw"] =
Promise.prototype.thenThrow =
function Promise$thenThrow(reason) {
    if (wrapsPrimitiveReceiver && isPrimitive(reason)) {
        return this._then(
            wrapper(reason, 1),
            void 0,
            void 0,
            void 0,
            void 0
       );
    }
    return this._then(thrower, void 0, void 0, reason, void 0);
};
};

},{"./util.js":38}],12:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseReduce = Promise.reduce;

Promise.prototype.each = function Promise$each(fn) {
    return PromiseReduce(this, fn, null, INTERNAL);
};

Promise.each = function Promise$Each(promises, fn) {
    return PromiseReduce(promises, fn, null, INTERNAL);
};
};

},{}],13:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var Objectfreeze = require("./es5.js").freeze;
var util = require("./util.js");
var inherits = util.inherits;
var notEnumerableProp = util.notEnumerableProp;

function markAsOriginatingFromRejection(e) {
    try {
        notEnumerableProp(e, "isOperational", true);
    }
    catch(ignore) {}
}

function originatesFromRejection(e) {
    if (e == null) return false;
    return ((e instanceof OperationalError) ||
        e["isOperational"] === true);
}

function isError(obj) {
    return obj instanceof Error;
}

function canAttach(obj) {
    return isError(obj);
}

function subError(nameProperty, defaultMessage) {
    function SubError(message) {
        if (!(this instanceof SubError)) return new SubError(message);
        this.message = typeof message === "string" ? message : defaultMessage;
        this.name = nameProperty;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    inherits(SubError, Error);
    return SubError;
}

var _TypeError, _RangeError;
var CancellationError = subError("CancellationError", "cancellation error");
var TimeoutError = subError("TimeoutError", "timeout error");
var AggregateError = subError("AggregateError", "aggregate error");
try {
    _TypeError = TypeError;
    _RangeError = RangeError;
} catch(e) {
    _TypeError = subError("TypeError", "type error");
    _RangeError = subError("RangeError", "range error");
}

var methods = ("join pop push shift unshift slice filter forEach some " +
    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

for (var i = 0; i < methods.length; ++i) {
    if (typeof Array.prototype[methods[i]] === "function") {
        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
    }
}

AggregateError.prototype.length = 0;
AggregateError.prototype["isOperational"] = true;
var level = 0;
AggregateError.prototype.toString = function() {
    var indent = Array(level * 4 + 1).join(" ");
    var ret = "\n" + indent + "AggregateError of:" + "\n";
    level++;
    indent = Array(level * 4 + 1).join(" ");
    for (var i = 0; i < this.length; ++i) {
        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
        var lines = str.split("\n");
        for (var j = 0; j < lines.length; ++j) {
            lines[j] = indent + lines[j];
        }
        str = lines.join("\n");
        ret += str + "\n";
    }
    level--;
    return ret;
};

function OperationalError(message) {
    this.name = "OperationalError";
    this.message = message;
    this.cause = message;
    this["isOperational"] = true;

    if (message instanceof Error) {
        this.message = message.message;
        this.stack = message.stack;
    } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

}
inherits(OperationalError, Error);

var key = "__BluebirdErrorTypes__";
var errorTypes = Error[key];
if (!errorTypes) {
    errorTypes = Objectfreeze({
        CancellationError: CancellationError,
        TimeoutError: TimeoutError,
        OperationalError: OperationalError,
        RejectionError: OperationalError,
        AggregateError: AggregateError
    });
    notEnumerableProp(Error, key, errorTypes);
}

module.exports = {
    Error: Error,
    TypeError: _TypeError,
    RangeError: _RangeError,
    CancellationError: errorTypes.CancellationError,
    OperationalError: errorTypes.OperationalError,
    TimeoutError: errorTypes.TimeoutError,
    AggregateError: errorTypes.AggregateError,
    originatesFromRejection: originatesFromRejection,
    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
    canAttach: canAttach
};

},{"./es5.js":15,"./util.js":38}],14:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
var TypeError = require('./errors.js').TypeError;

function apiRejection(msg) {
    var error = new TypeError(msg);
    var ret = Promise.rejected(error);
    var parent = ret._peekContext();
    if (parent != null) {
        parent._attachExtraTrace(error);
    }
    return ret;
}

return apiRejection;
};

},{"./errors.js":13}],15:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
var isES5 = (function(){
    "use strict";
    return this === void 0;
})();

if (isES5) {
    module.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        keys: Object.keys,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: isES5
    };
} else {
    var has = {}.hasOwnProperty;
    var str = {}.toString;
    var proto = {}.constructor.prototype;

    var ObjectKeys = function ObjectKeys(o) {
        var ret = [];
        for (var key in o) {
            if (has.call(o, key)) {
                ret.push(key);
            }
        }
        return ret;
    }

    var ObjectDefineProperty = function ObjectDefineProperty(o, key, desc) {
        o[key] = desc.value;
        return o;
    }

    var ObjectFreeze = function ObjectFreeze(obj) {
        return obj;
    }

    var ObjectGetPrototypeOf = function ObjectGetPrototypeOf(obj) {
        try {
            return Object(obj).constructor.prototype;
        }
        catch (e) {
            return proto;
        }
    }

    var ArrayIsArray = function ArrayIsArray(obj) {
        try {
            return str.call(obj) === "[object Array]";
        }
        catch(e) {
            return false;
        }
    }

    module.exports = {
        isArray: ArrayIsArray,
        keys: ObjectKeys,
        defineProperty: ObjectDefineProperty,
        freeze: ObjectFreeze,
        getPrototypeOf: ObjectGetPrototypeOf,
        isES5: isES5
    };
}

},{}],16:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseMap = Promise.map;

Promise.prototype.filter = function Promise$filter(fn, options) {
    return PromiseMap(this, fn, options, INTERNAL);
};

Promise.filter = function Promise$Filter(promises, fn, options) {
    return PromiseMap(promises, fn, options, INTERNAL);
};
};

},{}],17:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, NEXT_FILTER, cast) {
var util = require("./util.js");
var wrapsPrimitiveReceiver = util.wrapsPrimitiveReceiver;
var isPrimitive = util.isPrimitive;
var thrower = util.thrower;

function returnThis() {
    return this;
}
function throwThis() {
    throw this;
}
function return$(r) {
    return function Promise$_returner() {
        return r;
    };
}
function throw$(r) {
    return function Promise$_thrower() {
        throw r;
    };
}
function promisedFinally(ret, reasonOrValue, isFulfilled) {
    var then;
    if (wrapsPrimitiveReceiver && isPrimitive(reasonOrValue)) {
        then = isFulfilled ? return$(reasonOrValue) : throw$(reasonOrValue);
    } else {
        then = isFulfilled ? returnThis : throwThis;
    }
    return ret._then(then, thrower, void 0, reasonOrValue, void 0);
}

function finallyHandler(reasonOrValue) {
    var promise = this.promise;
    var handler = this.handler;

    var ret = promise._isBound()
                    ? handler.call(promise._boundTo)
                    : handler();

    if (ret !== void 0) {
        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            return promisedFinally(maybePromise, reasonOrValue,
                                    promise.isFulfilled());
        }
    }

    if (promise.isRejected()) {
        NEXT_FILTER.e = reasonOrValue;
        return NEXT_FILTER;
    } else {
        return reasonOrValue;
    }
}

function tapHandler(value) {
    var promise = this.promise;
    var handler = this.handler;

    var ret = promise._isBound()
                    ? handler.call(promise._boundTo, value)
                    : handler(value);

    if (ret !== void 0) {
        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            return promisedFinally(maybePromise, value, true);
        }
    }
    return value;
}

Promise.prototype._passThroughHandler =
function Promise$_passThroughHandler(handler, isFinally) {
    if (typeof handler !== "function") return this.then();

    var promiseAndHandler = {
        promise: this,
        handler: handler
    };

    return this._then(
            isFinally ? finallyHandler : tapHandler,
            isFinally ? finallyHandler : void 0, void 0,
            promiseAndHandler, void 0);
};

Promise.prototype.lastly =
Promise.prototype["finally"] = function Promise$finally(handler) {
    return this._passThroughHandler(handler, true);
};

Promise.prototype.tap = function Promise$tap(handler) {
    return this._passThroughHandler(handler, false);
};
};

},{"./util.js":38}],18:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, apiRejection, INTERNAL, cast) {
var errors = require("./errors.js");
var TypeError = errors.TypeError;
var deprecated = require("./util.js").deprecated;
var util = require("./util.js");
var errorObj = util.errorObj;
var tryCatch1 = util.tryCatch1;
var yieldHandlers = [];

function promiseFromYieldHandler(value, yieldHandlers) {
    var _errorObj = errorObj;
    var _Promise = Promise;
    var len = yieldHandlers.length;
    for (var i = 0; i < len; ++i) {
        var result = tryCatch1(yieldHandlers[i], void 0, value);
        if (result === _errorObj) {
            return _Promise.reject(_errorObj.e);
        }
        var maybePromise = cast(result, promiseFromYieldHandler);
        if (maybePromise instanceof _Promise) return maybePromise;
    }
    return null;
}

function PromiseSpawn(generatorFunction, receiver, yieldHandler) {
    var promise = this._promise = new Promise(INTERNAL);
    promise._setTrace(void 0);
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = void 0;
    this._yieldHandlers = typeof yieldHandler === "function"
        ? [yieldHandler].concat(yieldHandlers)
        : yieldHandlers;
}

PromiseSpawn.prototype.promise = function PromiseSpawn$promise() {
    return this._promise;
};

PromiseSpawn.prototype._run = function PromiseSpawn$_run() {
    this._generator = this._generatorFunction.call(this._receiver);
    this._receiver =
        this._generatorFunction = void 0;
    this._next(void 0);
};

PromiseSpawn.prototype._continue = function PromiseSpawn$_continue(result) {
    if (result === errorObj) {
        this._generator = void 0;
        var trace = errors.canAttach(result.e)
            ? result.e : new Error(result.e + "");
        this._promise._attachExtraTrace(trace);
        this._promise._reject(result.e, trace);
        return;
    }

    var value = result.value;
    if (result.done === true) {
        this._generator = void 0;
        if (!this._promise._tryFollow(value)) {
            this._promise._fulfill(value);
        }
    } else {
        var maybePromise = cast(value, void 0);
        if (!(maybePromise instanceof Promise)) {
            maybePromise =
                promiseFromYieldHandler(maybePromise, this._yieldHandlers);
            if (maybePromise === null) {
                this._throw(new TypeError("A value was yielded that could not be treated as a promise"));
                return;
            }
        }
        maybePromise._then(
            this._next,
            this._throw,
            void 0,
            this,
            null
       );
    }
};

PromiseSpawn.prototype._throw = function PromiseSpawn$_throw(reason) {
    if (errors.canAttach(reason))
        this._promise._attachExtraTrace(reason);
    this._continue(
        tryCatch1(this._generator["throw"], this._generator, reason)
   );
};

PromiseSpawn.prototype._next = function PromiseSpawn$_next(value) {
    this._continue(
        tryCatch1(this._generator.next, this._generator, value)
   );
};

Promise.coroutine =
function Promise$Coroutine(generatorFunction, options) {
    if (typeof generatorFunction !== "function") {
        throw new TypeError("generatorFunction must be a function");
    }
    var yieldHandler = Object(options).yieldHandler;
    var PromiseSpawn$ = PromiseSpawn;
    return function () {
        var generator = generatorFunction.apply(this, arguments);
        var spawn = new PromiseSpawn$(void 0, void 0, yieldHandler);
        spawn._generator = generator;
        spawn._next(void 0);
        return spawn.promise();
    };
};

Promise.coroutine.addYieldHandler = function(fn) {
    if (typeof fn !== "function") throw new TypeError("fn must be a function");
    yieldHandlers.push(fn);
};

Promise.spawn = function Promise$Spawn(generatorFunction) {
    deprecated("Promise.spawn is deprecated. Use Promise.coroutine instead.");
    if (typeof generatorFunction !== "function") {
        return apiRejection("generatorFunction must be a function");
    }
    var spawn = new PromiseSpawn(generatorFunction, this);
    var ret = spawn.promise();
    spawn._run(Promise.spawn);
    return ret;
};
};

},{"./errors.js":13,"./util.js":38}],19:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports =
function(Promise, PromiseArray, cast, INTERNAL) {
var util = require("./util.js");
var canEvaluate = util.canEvaluate;
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;


if (canEvaluate) {
    var thenCallback = function(i) {
        return new Function("value", "holder", "                             \n\
            'use strict';                                                    \n\
            holder.pIndex = value;                                           \n\
            holder.checkFulfillment(this);                                   \n\
            ".replace(/Index/g, i));
    };

    var caller = function(count) {
        var values = [];
        for (var i = 1; i <= count; ++i) values.push("holder.p" + i);
        return new Function("holder", "                                      \n\
            'use strict';                                                    \n\
            var callback = holder.fn;                                        \n\
            return callback(values);                                         \n\
            ".replace(/values/g, values.join(", ")));
    };
    var thenCallbacks = [];
    var callers = [void 0];
    for (var i = 1; i <= 5; ++i) {
        thenCallbacks.push(thenCallback(i));
        callers.push(caller(i));
    }

    var Holder = function(total, fn) {
        this.p1 = this.p2 = this.p3 = this.p4 = this.p5 = null;
        this.fn = fn;
        this.total = total;
        this.now = 0;
    };

    Holder.prototype.callers = callers;
    Holder.prototype.checkFulfillment = function(promise) {
        var now = this.now;
        now++;
        var total = this.total;
        if (now >= total) {
            var handler = this.callers[total];
            var ret = tryCatch1(handler, void 0, this);
            if (ret === errorObj) {
                promise._rejectUnchecked(ret.e);
            } else if (!promise._tryFollow(ret)) {
                promise._fulfillUnchecked(ret);
            }
        } else {
            this.now = now;
        }
    };
}

function reject(reason) {
    this._reject(reason);
}

Promise.join = function Promise$Join() {
    var last = arguments.length - 1;
    var fn;
    if (last > 0 && typeof arguments[last] === "function") {
        fn = arguments[last];
        if (last < 6 && canEvaluate) {
            var ret = new Promise(INTERNAL);
            ret._setTrace(void 0);
            var holder = new Holder(last, fn);
            var callbacks = thenCallbacks;
            for (var i = 0; i < last; ++i) {
                var maybePromise = cast(arguments[i], void 0);
                if (maybePromise instanceof Promise) {
                    if (maybePromise.isPending()) {
                        maybePromise._then(callbacks[i], reject,
                                           void 0, ret, holder);
                    } else if (maybePromise.isFulfilled()) {
                        callbacks[i].call(ret,
                                          maybePromise._settledValue, holder);
                    } else {
                        ret._reject(maybePromise._settledValue);
                        maybePromise._unsetRejectionIsUnhandled();
                    }
                } else {
                    callbacks[i].call(ret, maybePromise, holder);
                }
            }
            return ret;
        }
    }
    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
    var ret = new PromiseArray(args).promise();
    return fn !== void 0 ? ret.spread(fn) : ret;
};

};

},{"./util.js":38}],20:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray, apiRejection, cast, INTERNAL) {
var util = require("./util.js");
var tryCatch3 = util.tryCatch3;
var errorObj = util.errorObj;
var PENDING = {};
var EMPTY_ARRAY = [];

function MappingPromiseArray(promises, fn, limit, _filter) {
    this.constructor$(promises);
    this._callback = fn;
    this._preservedValues = _filter === INTERNAL
        ? new Array(this.length())
        : null;
    this._limit = limit;
    this._inFlight = 0;
    this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
    this._init$(void 0, -2);
}
util.inherits(MappingPromiseArray, PromiseArray);

MappingPromiseArray.prototype._init = function MappingPromiseArray$_init() {};

MappingPromiseArray.prototype._promiseFulfilled =
function MappingPromiseArray$_promiseFulfilled(value, index) {
    var values = this._values;
    if (values === null) return;

    var length = this.length();
    var preservedValues = this._preservedValues;
    var limit = this._limit;
    if (values[index] === PENDING) {
        values[index] = value;
        if (limit >= 1) {
            this._inFlight--;
            this._drainQueue();
            if (this._isResolved()) return;
        }
    } else {
        if (limit >= 1 && this._inFlight >= limit) {
            values[index] = value;
            this._queue.push(index);
            return;
        }
        if (preservedValues !== null) preservedValues[index] = value;

        var callback = this._callback;
        var receiver = this._promise._boundTo;
        var ret = tryCatch3(callback, receiver, value, index, length);
        if (ret === errorObj) return this._reject(ret.e);

        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            if (maybePromise.isPending()) {
                if (limit >= 1) this._inFlight++;
                values[index] = PENDING;
                return maybePromise._proxyPromiseArray(this, index);
            } else if (maybePromise.isFulfilled()) {
                ret = maybePromise.value();
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                return this._reject(maybePromise.reason());
            }
        }
        values[index] = ret;
    }
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= length) {
        if (preservedValues !== null) {
            this._filter(values, preservedValues);
        } else {
            this._resolve(values);
        }

    }
};

MappingPromiseArray.prototype._drainQueue =
function MappingPromiseArray$_drainQueue() {
    var queue = this._queue;
    var limit = this._limit;
    var values = this._values;
    while (queue.length > 0 && this._inFlight < limit) {
        var index = queue.pop();
        this._promiseFulfilled(values[index], index);
    }
};

MappingPromiseArray.prototype._filter =
function MappingPromiseArray$_filter(booleans, values) {
    var len = values.length;
    var ret = new Array(len);
    var j = 0;
    for (var i = 0; i < len; ++i) {
        if (booleans[i]) ret[j++] = values[i];
    }
    ret.length = j;
    this._resolve(ret);
};

MappingPromiseArray.prototype.preservedValues =
function MappingPromiseArray$preserveValues() {
    return this._preservedValues;
};

function map(promises, fn, options, _filter) {
    var limit = typeof options === "object" && options !== null
        ? options.concurrency
        : 0;
    limit = typeof limit === "number" &&
        isFinite(limit) && limit >= 1 ? limit : 0;
    return new MappingPromiseArray(promises, fn, limit, _filter);
}

Promise.prototype.map = function Promise$map(fn, options) {
    if (typeof fn !== "function") return apiRejection("fn must be a function");

    return map(this, fn, options, null).promise();
};

Promise.map = function Promise$Map(promises, fn, options, _filter) {
    if (typeof fn !== "function") return apiRejection("fn must be a function");
    return map(promises, fn, options, _filter).promise();
};


};

},{"./util.js":38}],21:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
var util = require("./util.js");
var async = require("./async.js");
var tryCatch2 = util.tryCatch2;
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;

function thrower(r) {
    throw r;
}

function Promise$_spreadAdapter(val, receiver) {
    if (!util.isArray(val)) return Promise$_successAdapter(val, receiver);
    var ret = util.tryCatchApply(this, [null].concat(val), receiver);
    if (ret === errorObj) {
        async.invokeLater(thrower, void 0, ret.e);
    }
}

function Promise$_successAdapter(val, receiver) {
    var nodeback = this;
    var ret = val === void 0
        ? tryCatch1(nodeback, receiver, null)
        : tryCatch2(nodeback, receiver, null, val);
    if (ret === errorObj) {
        async.invokeLater(thrower, void 0, ret.e);
    }
}
function Promise$_errorAdapter(reason, receiver) {
    var nodeback = this;
    var ret = tryCatch1(nodeback, receiver, reason);
    if (ret === errorObj) {
        async.invokeLater(thrower, void 0, ret.e);
    }
}

Promise.prototype.nodeify = function Promise$nodeify(nodeback, options) {
    if (typeof nodeback == "function") {
        var adapter = Promise$_successAdapter;
        if (options !== void 0 && Object(options).spread) {
            adapter = Promise$_spreadAdapter;
        }
        this._then(
            adapter,
            Promise$_errorAdapter,
            void 0,
            nodeback,
            this._boundTo
        );
    }
    return this;
};
};

},{"./async.js":5,"./util.js":38}],22:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray) {
var util = require("./util.js");
var async = require("./async.js");
var errors = require("./errors.js");
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;

Promise.prototype.progressed = function Promise$progressed(handler) {
    return this._then(void 0, void 0, handler, void 0, void 0);
};

Promise.prototype._progress = function Promise$_progress(progressValue) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._progressUnchecked(progressValue);

};

Promise.prototype._clearFirstHandlerData$Base =
Promise.prototype._clearFirstHandlerData;
Promise.prototype._clearFirstHandlerData =
function Promise$_clearFirstHandlerData() {
    this._clearFirstHandlerData$Base();
    this._progressHandler0 = void 0;
};

Promise.prototype._progressHandlerAt =
function Promise$_progressHandlerAt(index) {
    return index === 0
        ? this._progressHandler0
        : this[(index << 2) + index - 5 + 2];
};

Promise.prototype._doProgressWith =
function Promise$_doProgressWith(progression) {
    var progressValue = progression.value;
    var handler = progression.handler;
    var promise = progression.promise;
    var receiver = progression.receiver;

    var ret = tryCatch1(handler, receiver, progressValue);
    if (ret === errorObj) {
        if (ret.e != null &&
            ret.e.name !== "StopProgressPropagation") {
            var trace = errors.canAttach(ret.e)
                ? ret.e : new Error(ret.e + "");
            promise._attachExtraTrace(trace);
            promise._progress(ret.e);
        }
    } else if (ret instanceof Promise) {
        ret._then(promise._progress, null, null, promise, void 0);
    } else {
        promise._progress(ret);
    }
};


Promise.prototype._progressUnchecked =
function Promise$_progressUnchecked(progressValue) {
    if (!this.isPending()) return;
    var len = this._length();
    var progress = this._progress;
    for (var i = 0; i < len; i++) {
        var handler = this._progressHandlerAt(i);
        var promise = this._promiseAt(i);
        if (!(promise instanceof Promise)) {
            var receiver = this._receiverAt(i);
            if (typeof handler === "function") {
                handler.call(receiver, progressValue, promise);
            } else if (receiver instanceof Promise && receiver._isProxied()) {
                receiver._progressUnchecked(progressValue);
            } else if (receiver instanceof PromiseArray) {
                receiver._promiseProgressed(progressValue, promise);
            }
            continue;
        }

        if (typeof handler === "function") {
            async.invoke(this._doProgressWith, this, {
                handler: handler,
                promise: promise,
                receiver: this._receiverAt(i),
                value: progressValue
            });
        } else {
            async.invoke(progress, promise, progressValue);
        }
    }
};
};

},{"./async.js":5,"./errors.js":13,"./util.js":38}],23:[function(require,module,exports){
(function (process){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var old;
if (typeof Promise !== "undefined") old = Promise;
function noConflict(bluebird) {
    try { if (Promise === bluebird) Promise = old; }
    catch (e) {}
    return bluebird;
}
module.exports = function() {
var util = require("./util.js");
var async = require("./async.js");
var errors = require("./errors.js");

var INTERNAL = function(){};
var APPLY = {};
var NEXT_FILTER = {e: null};

var cast = require("./thenables.js")(Promise, INTERNAL);
var PromiseArray = require("./promise_array.js")(Promise, INTERNAL, cast);
var CapturedTrace = require("./captured_trace.js")();
var CatchFilter = require("./catch_filter.js")(NEXT_FILTER);
var PromiseResolver = require("./promise_resolver.js");

var isArray = util.isArray;

var errorObj = util.errorObj;
var tryCatch1 = util.tryCatch1;
var tryCatch2 = util.tryCatch2;
var tryCatchApply = util.tryCatchApply;
var RangeError = errors.RangeError;
var TypeError = errors.TypeError;
var CancellationError = errors.CancellationError;
var TimeoutError = errors.TimeoutError;
var OperationalError = errors.OperationalError;
var originatesFromRejection = errors.originatesFromRejection;
var markAsOriginatingFromRejection = errors.markAsOriginatingFromRejection;
var canAttach = errors.canAttach;
var thrower = util.thrower;
var apiRejection = require("./errors_api_rejection")(Promise);


var makeSelfResolutionError = function Promise$_makeSelfResolutionError() {
    return new TypeError("circular promise resolution chain");
};

function Promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("the promise constructor requires a resolver function");
    }
    if (this.constructor !== Promise) {
        throw new TypeError("the promise constructor cannot be invoked directly");
    }
    this._bitField = 0;
    this._fulfillmentHandler0 = void 0;
    this._rejectionHandler0 = void 0;
    this._promise0 = void 0;
    this._receiver0 = void 0;
    this._settledValue = void 0;
    this._boundTo = void 0;
    if (resolver !== INTERNAL) this._resolveFromResolver(resolver);
}

function returnFirstElement(elements) {
    return elements[0];
}

Promise.prototype.bind = function Promise$bind(thisArg) {
    var maybePromise = cast(thisArg, void 0);
    var ret = new Promise(INTERNAL);
    if (maybePromise instanceof Promise) {
        var binder = maybePromise.then(function(thisArg) {
            ret._setBoundTo(thisArg);
        });
        var p = Promise.all([this, binder]).then(returnFirstElement);
        ret._follow(p);
    } else {
        ret._follow(this);
        ret._setBoundTo(thisArg);
    }
    ret._propagateFrom(this, 2 | 1);
    return ret;
};

Promise.prototype.toString = function Promise$toString() {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] =
function Promise$catch(fn) {
    var len = arguments.length;
    if (len > 1) {
        var catchInstances = new Array(len - 1),
            j = 0, i;
        for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (typeof item === "function") {
                catchInstances[j++] = item;
            } else {
                var catchFilterTypeError =
                    new TypeError(
                        "A catch filter must be an error constructor "
                        + "or a filter function");

                this._attachExtraTrace(catchFilterTypeError);
                return Promise.reject(catchFilterTypeError);
            }
        }
        catchInstances.length = j;
        fn = arguments[i];

        this._resetTrace();
        var catchFilter = new CatchFilter(catchInstances, fn, this);
        return this._then(void 0, catchFilter.doFilter, void 0,
            catchFilter, void 0);
    }
    return this._then(void 0, fn, void 0, void 0, void 0);
};

function reflect() {
    return new Promise.PromiseInspection(this);
}

Promise.prototype.reflect = function Promise$reflect() {
    return this._then(reflect, reflect, void 0, this, void 0);
};

Promise.prototype.then =
function Promise$then(didFulfill, didReject, didProgress) {
    return this._then(didFulfill, didReject, didProgress,
        void 0, void 0);
};


Promise.prototype.done =
function Promise$done(didFulfill, didReject, didProgress) {
    var promise = this._then(didFulfill, didReject, didProgress,
        void 0, void 0);
    promise._setIsFinal();
};

Promise.prototype.spread = function Promise$spread(didFulfill, didReject) {
    return this._then(didFulfill, didReject, void 0,
        APPLY, void 0);
};

Promise.prototype.isCancellable = function Promise$isCancellable() {
    return !this.isResolved() &&
        this._cancellable();
};

Promise.prototype.toJSON = function Promise$toJSON() {
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: void 0,
        rejectionReason: void 0
    };
    if (this.isFulfilled()) {
        ret.fulfillmentValue = this._settledValue;
        ret.isFulfilled = true;
    } else if (this.isRejected()) {
        ret.rejectionReason = this._settledValue;
        ret.isRejected = true;
    }
    return ret;
};

Promise.prototype.all = function Promise$all() {
    return new PromiseArray(this).promise();
};


Promise.is = function Promise$Is(val) {
    return val instanceof Promise;
};

Promise.all = function Promise$All(promises) {
    return new PromiseArray(promises).promise();
};

Promise.prototype.error = function Promise$_error(fn) {
    return this.caught(originatesFromRejection, fn);
};

Promise.prototype._resolveFromSyncValue =
function Promise$_resolveFromSyncValue(value) {
    if (value === errorObj) {
        this._cleanValues();
        this._setRejected();
        var reason = value.e;
        this._settledValue = reason;
        this._tryAttachExtraTrace(reason);
        this._ensurePossibleRejectionHandled();
    } else {
        var maybePromise = cast(value, void 0);
        if (maybePromise instanceof Promise) {
            this._follow(maybePromise);
        } else {
            this._cleanValues();
            this._setFulfilled();
            this._settledValue = value;
        }
    }
};

Promise.method = function Promise$_Method(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("fn must be a function");
    }
    return function Promise$_method() {
        var value;
        switch(arguments.length) {
        case 0: value = tryCatch1(fn, this, void 0); break;
        case 1: value = tryCatch1(fn, this, arguments[0]); break;
        case 2: value = tryCatch2(fn, this, arguments[0], arguments[1]); break;
        default:
            var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
            value = tryCatchApply(fn, args, this); break;
        }
        var ret = new Promise(INTERNAL);
        ret._setTrace(void 0);
        ret._resolveFromSyncValue(value);
        return ret;
    };
};

Promise.attempt = Promise["try"] = function Promise$_Try(fn, args, ctx) {
    if (typeof fn !== "function") {
        return apiRejection("fn must be a function");
    }
    var value = isArray(args)
        ? tryCatchApply(fn, args, ctx)
        : tryCatch1(fn, ctx, args);

    var ret = new Promise(INTERNAL);
    ret._setTrace(void 0);
    ret._resolveFromSyncValue(value);
    return ret;
};

Promise.defer = Promise.pending = function Promise$Defer() {
    var promise = new Promise(INTERNAL);
    promise._setTrace(void 0);
    return new PromiseResolver(promise);
};

Promise.bind = function Promise$Bind(thisArg) {
    var maybePromise = cast(thisArg, void 0);
    var ret = new Promise(INTERNAL);
    ret._setTrace(void 0);

    if (maybePromise instanceof Promise) {
        var p = maybePromise.then(function(thisArg) {
            ret._setBoundTo(thisArg);
        });
        ret._follow(p);
    } else {
        ret._setBoundTo(thisArg);
        ret._setFulfilled();
    }
    return ret;
};

Promise.cast = function Promise$_Cast(obj) {
    var ret = cast(obj, void 0);
    if (!(ret instanceof Promise)) {
        var val = ret;
        ret = new Promise(INTERNAL);
        ret._setTrace(void 0);
        ret._setFulfilled();
        ret._cleanValues();
        ret._settledValue = val;
    }
    return ret;
};

Promise.resolve = Promise.fulfilled = Promise.cast;

Promise.reject = Promise.rejected = function Promise$Reject(reason) {
    var ret = new Promise(INTERNAL);
    ret._setTrace(void 0);
    markAsOriginatingFromRejection(reason);
    ret._cleanValues();
    ret._setRejected();
    ret._settledValue = reason;
    if (!canAttach(reason)) {
        var trace = new Error(reason + "");
        ret._setCarriedStackTrace(trace);
    }
    ret._ensurePossibleRejectionHandled();
    return ret;
};

Promise.onPossiblyUnhandledRejection =
function Promise$OnPossiblyUnhandledRejection(fn) {
        CapturedTrace.possiblyUnhandledRejection = typeof fn === "function"
                                                    ? fn : void 0;
};

var unhandledRejectionHandled;
Promise.onUnhandledRejectionHandled =
function Promise$onUnhandledRejectionHandled(fn) {
    unhandledRejectionHandled = typeof fn === "function" ? fn : void 0;
};

var debugging = false || !!(
    typeof process !== "undefined" &&
    typeof process.execPath === "string" &&
    typeof process.env === "object" &&
    (process.env["BLUEBIRD_DEBUG"] ||
        process.env["NODE_ENV"] === "development")
);


Promise.longStackTraces = function Promise$LongStackTraces() {
    if (async.haveItemsQueued() &&
        debugging === false
   ) {
        throw new Error("cannot enable long stack traces after promises have been created");
    }
    debugging = CapturedTrace.isSupported();
};

Promise.hasLongStackTraces = function Promise$HasLongStackTraces() {
    return debugging && CapturedTrace.isSupported();
};

Promise.prototype._then =
function Promise$_then(
    didFulfill,
    didReject,
    didProgress,
    receiver,
    internalData
) {
    var haveInternalData = internalData !== void 0;
    var ret = haveInternalData ? internalData : new Promise(INTERNAL);

    if (!haveInternalData) {
        if (debugging) {
            var haveSameContext = this._peekContext() === this._traceParent;
            ret._traceParent = haveSameContext ? this._traceParent : this;
        }
        ret._propagateFrom(this, 7);
    }

    var callbackIndex =
        this._addCallbacks(didFulfill, didReject, didProgress, ret, receiver);

    if (this.isResolved()) {
        async.invoke(this._queueSettleAt, this, callbackIndex);
    }

    return ret;
};

Promise.prototype._length = function Promise$_length() {
    return this._bitField & 262143;
};

Promise.prototype._isFollowingOrFulfilledOrRejected =
function Promise$_isFollowingOrFulfilledOrRejected() {
    return (this._bitField & 939524096) > 0;
};

Promise.prototype._isFollowing = function Promise$_isFollowing() {
    return (this._bitField & 536870912) === 536870912;
};

Promise.prototype._setLength = function Promise$_setLength(len) {
    this._bitField = (this._bitField & -262144) |
        (len & 262143);
};

Promise.prototype._setFulfilled = function Promise$_setFulfilled() {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._setRejected = function Promise$_setRejected() {
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._setFollowing = function Promise$_setFollowing() {
    this._bitField = this._bitField | 536870912;
};

Promise.prototype._setIsFinal = function Promise$_setIsFinal() {
    this._bitField = this._bitField | 33554432;
};

Promise.prototype._isFinal = function Promise$_isFinal() {
    return (this._bitField & 33554432) > 0;
};

Promise.prototype._cancellable = function Promise$_cancellable() {
    return (this._bitField & 67108864) > 0;
};

Promise.prototype._setCancellable = function Promise$_setCancellable() {
    this._bitField = this._bitField | 67108864;
};

Promise.prototype._unsetCancellable = function Promise$_unsetCancellable() {
    this._bitField = this._bitField & (~67108864);
};

Promise.prototype._setRejectionIsUnhandled =
function Promise$_setRejectionIsUnhandled() {
    this._bitField = this._bitField | 2097152;
};

Promise.prototype._unsetRejectionIsUnhandled =
function Promise$_unsetRejectionIsUnhandled() {
    this._bitField = this._bitField & (~2097152);
    if (this._isUnhandledRejectionNotified()) {
        this._unsetUnhandledRejectionIsNotified();
        this._notifyUnhandledRejectionIsHandled();
    }
};

Promise.prototype._isRejectionUnhandled =
function Promise$_isRejectionUnhandled() {
    return (this._bitField & 2097152) > 0;
};

Promise.prototype._setUnhandledRejectionIsNotified =
function Promise$_setUnhandledRejectionIsNotified() {
    this._bitField = this._bitField | 524288;
};

Promise.prototype._unsetUnhandledRejectionIsNotified =
function Promise$_unsetUnhandledRejectionIsNotified() {
    this._bitField = this._bitField & (~524288);
};

Promise.prototype._isUnhandledRejectionNotified =
function Promise$_isUnhandledRejectionNotified() {
    return (this._bitField & 524288) > 0;
};

Promise.prototype._setCarriedStackTrace =
function Promise$_setCarriedStackTrace(capturedTrace) {
    this._bitField = this._bitField | 1048576;
    this._fulfillmentHandler0 = capturedTrace;
};

Promise.prototype._unsetCarriedStackTrace =
function Promise$_unsetCarriedStackTrace() {
    this._bitField = this._bitField & (~1048576);
    this._fulfillmentHandler0 = void 0;
};

Promise.prototype._isCarryingStackTrace =
function Promise$_isCarryingStackTrace() {
    return (this._bitField & 1048576) > 0;
};

Promise.prototype._getCarriedStackTrace =
function Promise$_getCarriedStackTrace() {
    return this._isCarryingStackTrace()
        ? this._fulfillmentHandler0
        : void 0;
};

Promise.prototype._receiverAt = function Promise$_receiverAt(index) {
    var ret = index === 0
        ? this._receiver0
        : this[(index << 2) + index - 5 + 4];
    if (this._isBound() && ret === void 0) {
        return this._boundTo;
    }
    return ret;
};

Promise.prototype._promiseAt = function Promise$_promiseAt(index) {
    return index === 0
        ? this._promise0
        : this[(index << 2) + index - 5 + 3];
};

Promise.prototype._fulfillmentHandlerAt =
function Promise$_fulfillmentHandlerAt(index) {
    return index === 0
        ? this._fulfillmentHandler0
        : this[(index << 2) + index - 5 + 0];
};

Promise.prototype._rejectionHandlerAt =
function Promise$_rejectionHandlerAt(index) {
    return index === 0
        ? this._rejectionHandler0
        : this[(index << 2) + index - 5 + 1];
};

Promise.prototype._addCallbacks = function Promise$_addCallbacks(
    fulfill,
    reject,
    progress,
    promise,
    receiver
) {
    var index = this._length();

    if (index >= 262143 - 5) {
        index = 0;
        this._setLength(0);
    }

    if (index === 0) {
        this._promise0 = promise;
        if (receiver !== void 0) this._receiver0 = receiver;
        if (typeof fulfill === "function" && !this._isCarryingStackTrace())
            this._fulfillmentHandler0 = fulfill;
        if (typeof reject === "function") this._rejectionHandler0 = reject;
        if (typeof progress === "function") this._progressHandler0 = progress;
    } else {
        var base = (index << 2) + index - 5;
        this[base + 3] = promise;
        this[base + 4] = receiver;
        this[base + 0] = typeof fulfill === "function"
                                            ? fulfill : void 0;
        this[base + 1] = typeof reject === "function"
                                            ? reject : void 0;
        this[base + 2] = typeof progress === "function"
                                            ? progress : void 0;
    }
    this._setLength(index + 1);
    return index;
};

Promise.prototype._setProxyHandlers =
function Promise$_setProxyHandlers(receiver, promiseSlotValue) {
    var index = this._length();

    if (index >= 262143 - 5) {
        index = 0;
        this._setLength(0);
    }
    if (index === 0) {
        this._promise0 = promiseSlotValue;
        this._receiver0 = receiver;
    } else {
        var base = (index << 2) + index - 5;
        this[base + 3] = promiseSlotValue;
        this[base + 4] = receiver;
        this[base + 0] =
        this[base + 1] =
        this[base + 2] = void 0;
    }
    this._setLength(index + 1);
};

Promise.prototype._proxyPromiseArray =
function Promise$_proxyPromiseArray(promiseArray, index) {
    this._setProxyHandlers(promiseArray, index);
};

Promise.prototype._proxyPromise = function Promise$_proxyPromise(promise) {
    promise._setProxied();
    this._setProxyHandlers(promise, -15);
};

Promise.prototype._setBoundTo = function Promise$_setBoundTo(obj) {
    if (obj !== void 0) {
        this._bitField = this._bitField | 8388608;
        this._boundTo = obj;
    } else {
        this._bitField = this._bitField & (~8388608);
    }
};

Promise.prototype._isBound = function Promise$_isBound() {
    return (this._bitField & 8388608) === 8388608;
};

Promise.prototype._resolveFromResolver =
function Promise$_resolveFromResolver(resolver) {
    var promise = this;
    this._setTrace(void 0);
    this._pushContext();

    function Promise$_resolver(val) {
        if (promise._tryFollow(val)) {
            return;
        }
        promise._fulfill(val);
    }
    function Promise$_rejecter(val) {
        var trace = canAttach(val) ? val : new Error(val + "");
        promise._attachExtraTrace(trace);
        markAsOriginatingFromRejection(val);
        promise._reject(val, trace === val ? void 0 : trace);
    }
    var r = tryCatch2(resolver, void 0, Promise$_resolver, Promise$_rejecter);
    this._popContext();

    if (r !== void 0 && r === errorObj) {
        var e = r.e;
        var trace = canAttach(e) ? e : new Error(e + "");
        promise._reject(e, trace);
    }
};

Promise.prototype._spreadSlowCase =
function Promise$_spreadSlowCase(targetFn, promise, values, boundTo) {
    var promiseForAll = new PromiseArray(values).promise();
    var promise2 = promiseForAll._then(function() {
        return targetFn.apply(boundTo, arguments);
    }, void 0, void 0, APPLY, void 0);
    promise._follow(promise2);
};

Promise.prototype._callSpread =
function Promise$_callSpread(handler, promise, value) {
    var boundTo = this._boundTo;
    if (isArray(value)) {
        for (var i = 0, len = value.length; i < len; ++i) {
            if (cast(value[i], void 0) instanceof Promise) {
                this._spreadSlowCase(handler, promise, value, boundTo);
                return;
            }
        }
    }
    promise._pushContext();
    return tryCatchApply(handler, value, boundTo);
};

Promise.prototype._callHandler =
function Promise$_callHandler(
    handler, receiver, promise, value) {
    var x;
    if (receiver === APPLY && !this.isRejected()) {
        x = this._callSpread(handler, promise, value);
    } else {
        promise._pushContext();
        x = tryCatch1(handler, receiver, value);
    }
    promise._popContext();
    return x;
};

Promise.prototype._settlePromiseFromHandler =
function Promise$_settlePromiseFromHandler(
    handler, receiver, value, promise
) {
    if (!(promise instanceof Promise)) {
        handler.call(receiver, value, promise);
        return;
    }
    if (promise.isResolved()) return;
    var x = this._callHandler(handler, receiver, promise, value);
    if (promise._isFollowing()) return;

    if (x === errorObj || x === promise || x === NEXT_FILTER) {
        var err = x === promise
                    ? makeSelfResolutionError()
                    : x.e;
        var trace = canAttach(err) ? err : new Error(err + "");
        if (x !== NEXT_FILTER) promise._attachExtraTrace(trace);
        promise._rejectUnchecked(err, trace);
    } else {
        var castValue = cast(x, promise);
        if (castValue instanceof Promise) {
            if (castValue.isRejected() &&
                !castValue._isCarryingStackTrace() &&
                !canAttach(castValue._settledValue)) {
                var trace = new Error(castValue._settledValue + "");
                promise._attachExtraTrace(trace);
                castValue._setCarriedStackTrace(trace);
            }
            promise._follow(castValue);
            promise._propagateFrom(castValue, 1);
        } else {
            promise._fulfillUnchecked(x);
        }
    }
};

Promise.prototype._follow =
function Promise$_follow(promise) {
    this._setFollowing();

    if (promise.isPending()) {
        this._propagateFrom(promise, 1);
        promise._proxyPromise(this);
    } else if (promise.isFulfilled()) {
        this._fulfillUnchecked(promise._settledValue);
    } else {
        this._rejectUnchecked(promise._settledValue,
            promise._getCarriedStackTrace());
    }

    if (promise._isRejectionUnhandled()) promise._unsetRejectionIsUnhandled();

    if (debugging &&
        promise._traceParent == null) {
        promise._traceParent = this;
    }
};

Promise.prototype._tryFollow =
function Promise$_tryFollow(value) {
    if (this._isFollowingOrFulfilledOrRejected() ||
        value === this) {
        return false;
    }
    var maybePromise = cast(value, void 0);
    if (!(maybePromise instanceof Promise)) {
        return false;
    }
    this._follow(maybePromise);
    return true;
};

Promise.prototype._resetTrace = function Promise$_resetTrace() {
    if (debugging) {
        this._trace = new CapturedTrace(this._peekContext() === void 0);
    }
};

Promise.prototype._setTrace = function Promise$_setTrace(parent) {
    if (debugging) {
        var context = this._peekContext();
        this._traceParent = context;
        var isTopLevel = context === void 0;
        if (parent !== void 0 &&
            parent._traceParent === context) {
            this._trace = parent._trace;
        } else {
            this._trace = new CapturedTrace(isTopLevel);
        }
    }
    return this;
};

Promise.prototype._tryAttachExtraTrace =
function Promise$_tryAttachExtraTrace(error) {
    if (canAttach(error)) {
        this._attachExtraTrace(error);
    }
};

Promise.prototype._attachExtraTrace =
function Promise$_attachExtraTrace(error) {
    if (debugging) {
        var promise = this;
        var stack = error.stack;
        stack = typeof stack === "string" ? stack.split("\n") : [];
        CapturedTrace.protectErrorMessageNewlines(stack);
        var headerLineCount = 1;
        var combinedTraces = 1;
        while(promise != null &&
            promise._trace != null) {
            stack = CapturedTrace.combine(
                stack,
                promise._trace.stack.split("\n")
            );
            promise = promise._traceParent;
            combinedTraces++;
        }

        var stackTraceLimit = Error.stackTraceLimit || 10;
        var max = (stackTraceLimit + headerLineCount) * combinedTraces;
        var len = stack.length;
        if (len > max) {
            stack.length = max;
        }

        if (len > 0)
            stack[0] = stack[0].split("\u0002\u0000\u0001").join("\n");

        if (stack.length <= headerLineCount) {
            error.stack = "(No stack trace)";
        } else {
            error.stack = stack.join("\n");
        }
    }
};

Promise.prototype._cleanValues = function Promise$_cleanValues() {
    if (this._cancellable()) {
        this._cancellationParent = void 0;
    }
};

Promise.prototype._propagateFrom =
function Promise$_propagateFrom(parent, flags) {
    if ((flags & 1) > 0 && parent._cancellable()) {
        this._setCancellable();
        this._cancellationParent = parent;
    }
    if ((flags & 4) > 0) {
        this._setBoundTo(parent._boundTo);
    }
    if ((flags & 2) > 0) {
        this._setTrace(parent);
    }
};

Promise.prototype._fulfill = function Promise$_fulfill(value) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._fulfillUnchecked(value);
};

Promise.prototype._reject =
function Promise$_reject(reason, carriedStackTrace) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._rejectUnchecked(reason, carriedStackTrace);
};

Promise.prototype._settlePromiseAt = function Promise$_settlePromiseAt(index) {
    var handler = this.isFulfilled()
        ? this._fulfillmentHandlerAt(index)
        : this._rejectionHandlerAt(index);

    var value = this._settledValue;
    var receiver = this._receiverAt(index);
    var promise = this._promiseAt(index);

    if (typeof handler === "function") {
        this._settlePromiseFromHandler(handler, receiver, value, promise);
    } else {
        var done = false;
        var isFulfilled = this.isFulfilled();
        if (receiver !== void 0) {
            if (receiver instanceof Promise &&
                receiver._isProxied()) {
                receiver._unsetProxied();

                if (isFulfilled) receiver._fulfillUnchecked(value);
                else receiver._rejectUnchecked(value,
                    this._getCarriedStackTrace());
                done = true;
            } else if (receiver instanceof PromiseArray) {
                if (isFulfilled) receiver._promiseFulfilled(value, promise);
                else receiver._promiseRejected(value, promise);
                done = true;
            }
        }

        if (!done) {
            if (isFulfilled) promise._fulfill(value);
            else promise._reject(value, this._getCarriedStackTrace());
        }
    }

    if (index >= 4) {
        this._queueGC();
    }
};

Promise.prototype._isProxied = function Promise$_isProxied() {
    return (this._bitField & 4194304) === 4194304;
};

Promise.prototype._setProxied = function Promise$_setProxied() {
    this._bitField = this._bitField | 4194304;
};

Promise.prototype._unsetProxied = function Promise$_unsetProxied() {
    this._bitField = this._bitField & (~4194304);
};

Promise.prototype._isGcQueued = function Promise$_isGcQueued() {
    return (this._bitField & -1073741824) === -1073741824;
};

Promise.prototype._setGcQueued = function Promise$_setGcQueued() {
    this._bitField = this._bitField | -1073741824;
};

Promise.prototype._unsetGcQueued = function Promise$_unsetGcQueued() {
    this._bitField = this._bitField & (~-1073741824);
};

Promise.prototype._queueGC = function Promise$_queueGC() {
    if (this._isGcQueued()) return;
    this._setGcQueued();
    async.invokeLater(this._gc, this, void 0);
};

Promise.prototype._gc = function Promise$gc() {
    var len = this._length() * 5 - 5;
    for (var i = 0; i < len; i++) {
        delete this[i];
    }
    this._clearFirstHandlerData();
    this._setLength(0);
    this._unsetGcQueued();
};

Promise.prototype._clearFirstHandlerData =
function Promise$_clearFirstHandlerData() {
    this._fulfillmentHandler0 = void 0;
    this._rejectionHandler0 = void 0;
    this._promise0 = void 0;
    this._receiver0 = void 0;
};

Promise.prototype._queueSettleAt = function Promise$_queueSettleAt(index) {
    if (this._isRejectionUnhandled()) this._unsetRejectionIsUnhandled();
    async.invoke(this._settlePromiseAt, this, index);
};

Promise.prototype._fulfillUnchecked =
function Promise$_fulfillUnchecked(value) {
    if (!this.isPending()) return;
    if (value === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._rejectUnchecked(err, void 0);
    }
    this._cleanValues();
    this._setFulfilled();
    this._settledValue = value;
    var len = this._length();

    if (len > 0) {
        async.invoke(this._settlePromises, this, len);
    }
};

Promise.prototype._rejectUncheckedCheckError =
function Promise$_rejectUncheckedCheckError(reason) {
    var trace = canAttach(reason) ? reason : new Error(reason + "");
    this._rejectUnchecked(reason, trace === reason ? void 0 : trace);
};

Promise.prototype._rejectUnchecked =
function Promise$_rejectUnchecked(reason, trace) {
    if (!this.isPending()) return;
    if (reason === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._rejectUnchecked(err);
    }
    this._cleanValues();
    this._setRejected();
    this._settledValue = reason;

    if (this._isFinal()) {
        async.invokeLater(thrower, void 0, trace === void 0 ? reason : trace);
        return;
    }
    var len = this._length();

    if (trace !== void 0) this._setCarriedStackTrace(trace);

    if (len > 0) {
        async.invoke(this._rejectPromises, this, null);
    } else {
        this._ensurePossibleRejectionHandled();
    }
};

Promise.prototype._rejectPromises = function Promise$_rejectPromises() {
    this._settlePromises();
    this._unsetCarriedStackTrace();
};

Promise.prototype._settlePromises = function Promise$_settlePromises() {
    var len = this._length();
    for (var i = 0; i < len; i++) {
        this._settlePromiseAt(i);
    }
};

Promise.prototype._ensurePossibleRejectionHandled =
function Promise$_ensurePossibleRejectionHandled() {
    this._setRejectionIsUnhandled();
    if (CapturedTrace.possiblyUnhandledRejection !== void 0) {
        async.invokeLater(this._notifyUnhandledRejection, this, void 0);
    }
};

Promise.prototype._notifyUnhandledRejectionIsHandled =
function Promise$_notifyUnhandledRejectionIsHandled() {
    if (typeof unhandledRejectionHandled === "function") {
        async.invokeLater(unhandledRejectionHandled, void 0, this);
    }
};

Promise.prototype._notifyUnhandledRejection =
function Promise$_notifyUnhandledRejection() {
    if (this._isRejectionUnhandled()) {
        var reason = this._settledValue;
        var trace = this._getCarriedStackTrace();

        this._setUnhandledRejectionIsNotified();

        if (trace !== void 0) {
            this._unsetCarriedStackTrace();
            reason = trace;
        }
        if (typeof CapturedTrace.possiblyUnhandledRejection === "function") {
            CapturedTrace.possiblyUnhandledRejection(reason, this);
        }
    }
};

var contextStack = [];
Promise.prototype._peekContext = function Promise$_peekContext() {
    var lastIndex = contextStack.length - 1;
    if (lastIndex >= 0) {
        return contextStack[lastIndex];
    }
    return void 0;

};

Promise.prototype._pushContext = function Promise$_pushContext() {
    if (!debugging) return;
    contextStack.push(this);
};

Promise.prototype._popContext = function Promise$_popContext() {
    if (!debugging) return;
    contextStack.pop();
};

Promise.noConflict = function Promise$NoConflict() {
    return noConflict(Promise);
};

Promise.setScheduler = function(fn) {
    if (typeof fn !== "function") throw new TypeError("fn must be a function");
    async._schedule = fn;
};

if (!CapturedTrace.isSupported()) {
    Promise.longStackTraces = function(){};
    debugging = false;
}

Promise._makeSelfResolutionError = makeSelfResolutionError;
require("./finally.js")(Promise, NEXT_FILTER, cast);
require("./direct_resolve.js")(Promise);
require("./synchronous_inspection.js")(Promise);
require("./join.js")(Promise, PromiseArray, cast, INTERNAL);
Promise.RangeError = RangeError;
Promise.CancellationError = CancellationError;
Promise.TimeoutError = TimeoutError;
Promise.TypeError = TypeError;
Promise.OperationalError = OperationalError;
Promise.RejectionError = OperationalError;
Promise.AggregateError = errors.AggregateError;

util.toFastProperties(Promise);
util.toFastProperties(Promise.prototype);
Promise.Promise = Promise;
require('./timers.js')(Promise,INTERNAL,cast);
require('./race.js')(Promise,INTERNAL,cast);
require('./call_get.js')(Promise);
require('./generators.js')(Promise,apiRejection,INTERNAL,cast);
require('./map.js')(Promise,PromiseArray,apiRejection,cast,INTERNAL);
require('./nodeify.js')(Promise);
require('./promisify.js')(Promise,INTERNAL);
require('./props.js')(Promise,PromiseArray,cast);
require('./reduce.js')(Promise,PromiseArray,apiRejection,cast,INTERNAL);
require('./settle.js')(Promise,PromiseArray);
require('./some.js')(Promise,PromiseArray,apiRejection);
require('./progress.js')(Promise,PromiseArray);
require('./cancel.js')(Promise,INTERNAL);
require('./filter.js')(Promise,INTERNAL);
require('./any.js')(Promise,PromiseArray);
require('./each.js')(Promise,INTERNAL);
require('./using.js')(Promise,apiRejection,cast);

Promise.prototype = Promise.prototype;
return Promise;

};

}).call(this,require('_process'))
},{"./any.js":4,"./async.js":5,"./call_get.js":7,"./cancel.js":8,"./captured_trace.js":9,"./catch_filter.js":10,"./direct_resolve.js":11,"./each.js":12,"./errors.js":13,"./errors_api_rejection":14,"./filter.js":16,"./finally.js":17,"./generators.js":18,"./join.js":19,"./map.js":20,"./nodeify.js":21,"./progress.js":22,"./promise_array.js":24,"./promise_resolver.js":25,"./promisify.js":26,"./props.js":27,"./race.js":29,"./reduce.js":30,"./settle.js":32,"./some.js":33,"./synchronous_inspection.js":34,"./thenables.js":35,"./timers.js":36,"./using.js":37,"./util.js":38,"_process":39}],24:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL, cast) {
var canAttach = require("./errors.js").canAttach;
var util = require("./util.js");
var isArray = util.isArray;

function toResolutionValue(val) {
    switch(val) {
    case -1: return void 0;
    case -2: return [];
    case -3: return {};
    }
}

function PromiseArray(values) {
    var promise = this._promise = new Promise(INTERNAL);
    var parent = void 0;
    if (values instanceof Promise) {
        parent = values;
        promise._propagateFrom(parent, 1 | 4);
    }
    promise._setTrace(parent);
    this._values = values;
    this._length = 0;
    this._totalResolved = 0;
    this._init(void 0, -2);
}
PromiseArray.prototype.length = function PromiseArray$length() {
    return this._length;
};

PromiseArray.prototype.promise = function PromiseArray$promise() {
    return this._promise;
};

PromiseArray.prototype._init =
function PromiseArray$_init(_, resolveValueIfEmpty) {
    var values = cast(this._values, void 0);
    if (values instanceof Promise) {
        this._values = values;
        values._setBoundTo(this._promise._boundTo);
        if (values.isFulfilled()) {
            values = values._settledValue;
            if (!isArray(values)) {
                var err = new Promise.TypeError("expecting an array, a promise or a thenable");
                this.__hardReject__(err);
                return;
            }
        } else if (values.isPending()) {
            values._then(
                PromiseArray$_init,
                this._reject,
                void 0,
                this,
                resolveValueIfEmpty
           );
            return;
        } else {
            values._unsetRejectionIsUnhandled();
            this._reject(values._settledValue);
            return;
        }
    } else if (!isArray(values)) {
        var err = new Promise.TypeError("expecting an array, a promise or a thenable");
        this.__hardReject__(err);
        return;
    }

    if (values.length === 0) {
        if (resolveValueIfEmpty === -5) {
            this._resolveEmptyArray();
        }
        else {
            this._resolve(toResolutionValue(resolveValueIfEmpty));
        }
        return;
    }
    var len = this.getActualLength(values.length);
    var newLen = len;
    var newValues = this.shouldCopyValues() ? new Array(len) : this._values;
    var isDirectScanNeeded = false;
    for (var i = 0; i < len; ++i) {
        var maybePromise = cast(values[i], void 0);
        if (maybePromise instanceof Promise) {
            if (maybePromise.isPending()) {
                maybePromise._proxyPromiseArray(this, i);
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                isDirectScanNeeded = true;
            }
        } else {
            isDirectScanNeeded = true;
        }
        newValues[i] = maybePromise;
    }
    this._values = newValues;
    this._length = newLen;
    if (isDirectScanNeeded) {
        this._scanDirectValues(len);
    }
};

PromiseArray.prototype._settlePromiseAt =
function PromiseArray$_settlePromiseAt(index) {
    var value = this._values[index];
    if (!(value instanceof Promise)) {
        this._promiseFulfilled(value, index);
    } else if (value.isFulfilled()) {
        this._promiseFulfilled(value._settledValue, index);
    } else if (value.isRejected()) {
        this._promiseRejected(value._settledValue, index);
    }
};

PromiseArray.prototype._scanDirectValues =
function PromiseArray$_scanDirectValues(len) {
    for (var i = 0; i < len; ++i) {
        if (this._isResolved()) {
            break;
        }
        this._settlePromiseAt(i);
    }
};

PromiseArray.prototype._isResolved = function PromiseArray$_isResolved() {
    return this._values === null;
};

PromiseArray.prototype._resolve = function PromiseArray$_resolve(value) {
    this._values = null;
    this._promise._fulfill(value);
};

PromiseArray.prototype.__hardReject__ =
PromiseArray.prototype._reject = function PromiseArray$_reject(reason) {
    this._values = null;
    var trace = canAttach(reason) ? reason : new Error(reason + "");
    this._promise._attachExtraTrace(trace);
    this._promise._reject(reason, trace);
};

PromiseArray.prototype._promiseProgressed =
function PromiseArray$_promiseProgressed(progressValue, index) {
    if (this._isResolved()) return;
    this._promise._progress({
        index: index,
        value: progressValue
    });
};


PromiseArray.prototype._promiseFulfilled =
function PromiseArray$_promiseFulfilled(value, index) {
    if (this._isResolved()) return;
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
    }
};

PromiseArray.prototype._promiseRejected =
function PromiseArray$_promiseRejected(reason, index) {
    if (this._isResolved()) return;
    this._totalResolved++;
    this._reject(reason);
};

PromiseArray.prototype.shouldCopyValues =
function PromiseArray$_shouldCopyValues() {
    return true;
};

PromiseArray.prototype.getActualLength =
function PromiseArray$getActualLength(len) {
    return len;
};

return PromiseArray;
};

},{"./errors.js":13,"./util.js":38}],25:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var util = require("./util.js");
var maybeWrapAsError = util.maybeWrapAsError;
var errors = require("./errors.js");
var TimeoutError = errors.TimeoutError;
var OperationalError = errors.OperationalError;
var async = require("./async.js");
var haveGetters = util.haveGetters;
var es5 = require("./es5.js");

function isUntypedError(obj) {
    return obj instanceof Error &&
        es5.getPrototypeOf(obj) === Error.prototype;
}

function wrapAsOperationalError(obj) {
    var ret;
    if (isUntypedError(obj)) {
        ret = new OperationalError(obj);
    } else {
        ret = obj;
    }
    errors.markAsOriginatingFromRejection(ret);
    return ret;
}

function nodebackForPromise(promise) {
    function PromiseResolver$_callback(err, value) {
        if (promise === null) return;

        if (err) {
            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        } else if (arguments.length > 2) {
            var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
            promise._fulfill(args);
        } else {
            promise._fulfill(value);
        }

        promise = null;
    }
    return PromiseResolver$_callback;
}


var PromiseResolver;
if (!haveGetters) {
    PromiseResolver = function PromiseResolver(promise) {
        this.promise = promise;
        this.asCallback = nodebackForPromise(promise);
        this.callback = this.asCallback;
    };
}
else {
    PromiseResolver = function PromiseResolver(promise) {
        this.promise = promise;
    };
}
if (haveGetters) {
    var prop = {
        get: function() {
            return nodebackForPromise(this.promise);
        }
    };
    es5.defineProperty(PromiseResolver.prototype, "asCallback", prop);
    es5.defineProperty(PromiseResolver.prototype, "callback", prop);
}

PromiseResolver._nodebackForPromise = nodebackForPromise;

PromiseResolver.prototype.toString = function PromiseResolver$toString() {
    return "[object PromiseResolver]";
};

PromiseResolver.prototype.resolve =
PromiseResolver.prototype.fulfill = function PromiseResolver$resolve(value) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.");
    }

    var promise = this.promise;
    if (promise._tryFollow(value)) {
        return;
    }
    async.invoke(promise._fulfill, promise, value);
};

PromiseResolver.prototype.reject = function PromiseResolver$reject(reason) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.");
    }

    var promise = this.promise;
    errors.markAsOriginatingFromRejection(reason);
    var trace = errors.canAttach(reason) ? reason : new Error(reason + "");
    promise._attachExtraTrace(trace);
    async.invoke(promise._reject, promise, reason);
    if (trace !== reason) {
        async.invoke(this._setCarriedStackTrace, this, trace);
    }
};

PromiseResolver.prototype.progress =
function PromiseResolver$progress(value) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.");
    }
    async.invoke(this.promise._progress, this.promise, value);
};

PromiseResolver.prototype.cancel = function PromiseResolver$cancel() {
    async.invoke(this.promise.cancel, this.promise, void 0);
};

PromiseResolver.prototype.timeout = function PromiseResolver$timeout() {
    this.reject(new TimeoutError("timeout"));
};

PromiseResolver.prototype.isResolved = function PromiseResolver$isResolved() {
    return this.promise.isResolved();
};

PromiseResolver.prototype.toJSON = function PromiseResolver$toJSON() {
    return this.promise.toJSON();
};

PromiseResolver.prototype._setCarriedStackTrace =
function PromiseResolver$_setCarriedStackTrace(trace) {
    if (this.promise.isRejected()) {
        this.promise._setCarriedStackTrace(trace);
    }
};

module.exports = PromiseResolver;

},{"./async.js":5,"./errors.js":13,"./es5.js":15,"./util.js":38}],26:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var THIS = {};
var util = require("./util.js");
var nodebackForPromise = require("./promise_resolver.js")
    ._nodebackForPromise;
var withAppended = util.withAppended;
var maybeWrapAsError = util.maybeWrapAsError;
var canEvaluate = util.canEvaluate;
var TypeError = require("./errors").TypeError;
var defaultSuffix = "Async";
var defaultFilter = function(name, func) {
    return util.isIdentifier(name) &&
        name.charAt(0) !== "_" &&
        !util.isClass(func);
};
var defaultPromisified = {__isPromisified__: true};


function escapeIdentRegex(str) {
    return str.replace(/([$])/, "\\$");
}

function isPromisified(fn) {
    try {
        return fn.__isPromisified__ === true;
    }
    catch (e) {
        return false;
    }
}

function hasPromisified(obj, key, suffix) {
    var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                            defaultPromisified);
    return val ? isPromisified(val) : false;
}
function checkValid(ret, suffix, suffixRegexp) {
    for (var i = 0; i < ret.length; i += 2) {
        var key = ret[i];
        if (suffixRegexp.test(key)) {
            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
            for (var j = 0; j < ret.length; j += 2) {
                if (ret[j] === keyWithoutAsyncSuffix) {
                    throw new TypeError("Cannot promisify an API " +
                        "that has normal methods with '"+suffix+"'-suffix");
                }
            }
        }
    }
}

function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
    var keys = util.inheritedDataKeys(obj);
    var ret = [];
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = obj[key];
        if (typeof value === "function" &&
            !isPromisified(value) &&
            !hasPromisified(obj, key, suffix) &&
            filter(key, value, obj)) {
            ret.push(key, value);
        }
    }
    checkValid(ret, suffix, suffixRegexp);
    return ret;
}

function switchCaseArgumentOrder(likelyArgumentCount) {
    var ret = [likelyArgumentCount];
    var min = Math.max(0, likelyArgumentCount - 1 - 5);
    for(var i = likelyArgumentCount - 1; i >= min; --i) {
        if (i === likelyArgumentCount) continue;
        ret.push(i);
    }
    for(var i = likelyArgumentCount + 1; i <= 5; ++i) {
        ret.push(i);
    }
    return ret;
}

function argumentSequence(argumentCount) {
    return util.filledRange(argumentCount, "arguments[", "]");
}

function parameterDeclaration(parameterCount) {
    return util.filledRange(parameterCount, "_arg", "");
}

function parameterCount(fn) {
    if (typeof fn.length === "number") {
        return Math.max(Math.min(fn.length, 1023 + 1), 0);
    }
    return 0;
}

function generatePropertyAccess(key) {
    if (util.isIdentifier(key)) {
        return "." + key;
    }
    else return "['" + key.replace(/(['\\])/g, "\\$1") + "']";
}

function makeNodePromisifiedEval(callback, receiver, originalName, fn, suffix) {
    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
    var callbackName =
        (typeof originalName === "string" && util.isIdentifier(originalName)
            ? originalName + suffix
            : "promisified");

    function generateCallForArgumentCount(count) {
        var args = argumentSequence(count).join(", ");
        var comma = count > 0 ? ", " : "";
        var ret;
        if (typeof callback === "string") {
            ret = "                                                          \n\
                this.method({{args}}, fn);                                   \n\
                break;                                                       \n\
            ".replace(".method", generatePropertyAccess(callback));
        } else if (receiver === THIS) {
            ret =  "                                                         \n\
                callback.call(this, {{args}}, fn);                           \n\
                break;                                                       \n\
            ";
        } else if (receiver !== void 0) {
            ret =  "                                                         \n\
                callback.call(receiver, {{args}}, fn);                       \n\
                break;                                                       \n\
            ";
        } else {
            ret =  "                                                         \n\
                callback({{args}}, fn);                                      \n\
                break;                                                       \n\
            ";
        }
        return ret.replace("{{args}}", args).replace(", ", comma);
    }

    function generateArgumentSwitchCase() {
        var ret = "";
        for(var i = 0; i < argumentOrder.length; ++i) {
            ret += "case " + argumentOrder[i] +":" +
                generateCallForArgumentCount(argumentOrder[i]);
        }
        var codeForCall;
        if (typeof callback === "string") {
            codeForCall = "                                                  \n\
                this.property.apply(this, args);                             \n\
            "
                .replace(".property", generatePropertyAccess(callback));
        } else if (receiver === THIS) {
            codeForCall = "                                                  \n\
                callback.apply(this, args);                                  \n\
            ";
        } else {
            codeForCall = "                                                  \n\
                callback.apply(receiver, args);                              \n\
            ";
        }

        ret += "                                                             \n\
        default:                                                             \n\
            var args = new Array(len + 1);                                   \n\
            var i = 0;                                                       \n\
            for (var i = 0; i < len; ++i) {                                  \n\
               args[i] = arguments[i];                                       \n\
            }                                                                \n\
            args[i] = fn;                                                    \n\
            [CodeForCall]                                                    \n\
            break;                                                           \n\
        ".replace("[CodeForCall]", codeForCall);
        return ret;
    }

    return new Function("Promise",
                        "callback",
                        "receiver",
                        "withAppended",
                        "maybeWrapAsError",
                        "nodebackForPromise",
                        "INTERNAL","                                         \n\
        var ret = function FunctionName(Parameters) {                        \n\
            'use strict';                                                    \n\
            var len = arguments.length;                                      \n\
            var promise = new Promise(INTERNAL);                             \n\
            promise._setTrace(void 0);                                       \n\
            var fn = nodebackForPromise(promise);                            \n\
            try {                                                            \n\
                switch(len) {                                                \n\
                    [CodeForSwitchCase]                                      \n\
                }                                                            \n\
            } catch (e) {                                                    \n\
                var wrapped = maybeWrapAsError(e);                           \n\
                promise._attachExtraTrace(wrapped);                          \n\
                promise._reject(wrapped);                                    \n\
            }                                                                \n\
            return promise;                                                  \n\
        };                                                                   \n\
        ret.__isPromisified__ = true;                                        \n\
        return ret;                                                          \n\
        "
        .replace("FunctionName", callbackName)
        .replace("Parameters", parameterDeclaration(newParameterCount))
        .replace("[CodeForSwitchCase]", generateArgumentSwitchCase()))(
            Promise,
            callback,
            receiver,
            withAppended,
            maybeWrapAsError,
            nodebackForPromise,
            INTERNAL
        );
}

function makeNodePromisifiedClosure(callback, receiver) {
    function promisified() {
        var _receiver = receiver;
        if (receiver === THIS) _receiver = this;
        if (typeof callback === "string") {
            callback = _receiver[callback];
        }
        var promise = new Promise(INTERNAL);
        promise._setTrace(void 0);
        var fn = nodebackForPromise(promise);
        try {
            callback.apply(_receiver, withAppended(arguments, fn));
        } catch(e) {
            var wrapped = maybeWrapAsError(e);
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        }
        return promise;
    }
    promisified.__isPromisified__ = true;
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

function promisifyAll(obj, suffix, filter, promisifier) {
    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
    var methods =
        promisifiableMethods(obj, suffix, suffixRegexp, filter);

    for (var i = 0, len = methods.length; i < len; i+= 2) {
        var key = methods[i];
        var fn = methods[i+1];
        var promisifiedKey = key + suffix;
        obj[promisifiedKey] = promisifier === makeNodePromisified
                ? makeNodePromisified(key, THIS, key, fn, suffix)
                : promisifier(fn);
    }
    util.toFastProperties(obj);
    return obj;
}

function promisify(callback, receiver) {
    return makeNodePromisified(callback, receiver, void 0, callback);
}

Promise.promisify = function Promise$Promisify(fn, receiver) {
    if (typeof fn !== "function") {
        throw new TypeError("fn must be a function");
    }
    if (isPromisified(fn)) {
        return fn;
    }
    return promisify(fn, arguments.length < 2 ? THIS : receiver);
};

Promise.promisifyAll = function Promise$PromisifyAll(target, options) {
    if (typeof target !== "function" && typeof target !== "object") {
        throw new TypeError("the target of promisifyAll must be an object or a function");
    }
    options = Object(options);
    var suffix = options.suffix;
    if (typeof suffix !== "string") suffix = defaultSuffix;
    var filter = options.filter;
    if (typeof filter !== "function") filter = defaultFilter;
    var promisifier = options.promisifier;
    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

    if (!util.isIdentifier(suffix)) {
        throw new RangeError("suffix must be a valid identifier");
    }

    var keys = util.inheritedDataKeys(target, {includeHidden: true});
    for (var i = 0; i < keys.length; ++i) {
        var value = target[keys[i]];
        if (keys[i] !== "constructor" &&
            util.isClass(value)) {
            promisifyAll(value.prototype, suffix, filter, promisifier);
            promisifyAll(value, suffix, filter, promisifier);
        }
    }

    return promisifyAll(target, suffix, filter, promisifier);
};
};


},{"./errors":13,"./promise_resolver.js":25,"./util.js":38}],27:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray, cast) {
var util = require("./util.js");
var apiRejection = require("./errors_api_rejection")(Promise);
var isObject = util.isObject;
var es5 = require("./es5.js");

function PropertiesPromiseArray(obj) {
    var keys = es5.keys(obj);
    var len = keys.length;
    var values = new Array(len * 2);
    for (var i = 0; i < len; ++i) {
        var key = keys[i];
        values[i] = obj[key];
        values[i + len] = key;
    }
    this.constructor$(values);
}
util.inherits(PropertiesPromiseArray, PromiseArray);

PropertiesPromiseArray.prototype._init =
function PropertiesPromiseArray$_init() {
    this._init$(void 0, -3) ;
};

PropertiesPromiseArray.prototype._promiseFulfilled =
function PropertiesPromiseArray$_promiseFulfilled(value, index) {
    if (this._isResolved()) return;
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        var val = {};
        var keyOffset = this.length();
        for (var i = 0, len = this.length(); i < len; ++i) {
            val[this._values[i + keyOffset]] = this._values[i];
        }
        this._resolve(val);
    }
};

PropertiesPromiseArray.prototype._promiseProgressed =
function PropertiesPromiseArray$_promiseProgressed(value, index) {
    if (this._isResolved()) return;

    this._promise._progress({
        key: this._values[index + this.length()],
        value: value
    });
};

PropertiesPromiseArray.prototype.shouldCopyValues =
function PropertiesPromiseArray$_shouldCopyValues() {
    return false;
};

PropertiesPromiseArray.prototype.getActualLength =
function PropertiesPromiseArray$getActualLength(len) {
    return len >> 1;
};

function Promise$_Props(promises) {
    var ret;
    var castValue = cast(promises, void 0);

    if (!isObject(castValue)) {
        return apiRejection("cannot await properties of a non-object");
    } else if (castValue instanceof Promise) {
        ret = castValue._then(Promise.props, void 0, void 0, void 0, void 0);
    } else {
        ret = new PropertiesPromiseArray(castValue).promise();
    }

    if (castValue instanceof Promise) {
        ret._propagateFrom(castValue, 4);
    }
    return ret;
}

Promise.prototype.props = function Promise$props() {
    return Promise$_Props(this);
};

Promise.props = function Promise$Props(promises) {
    return Promise$_Props(promises);
};
};

},{"./errors_api_rejection":14,"./es5.js":15,"./util.js":38}],28:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
function arrayCopy(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
    }
}

function Queue(capacity) {
    this._capacity = capacity;
    this._length = 0;
    this._front = 0;
    this._makeCapacity();
}

Queue.prototype._willBeOverCapacity =
function Queue$_willBeOverCapacity(size) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function Queue$_pushOne(arg) {
    var length = this.length();
    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype.push = function Queue$push(fn, receiver, arg) {
    var length = this.length() + 3;
    if (this._willBeOverCapacity(length)) {
        this._pushOne(fn);
        this._pushOne(receiver);
        this._pushOne(arg);
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity(length);
    var wrapMask = this._capacity - 1;
    this[(j + 0) & wrapMask] = fn;
    this[(j + 1) & wrapMask] = receiver;
    this[(j + 2) & wrapMask] = arg;
    this._length = length;
};

Queue.prototype.shift = function Queue$shift() {
    var front = this._front,
        ret = this[front];

    this[front] = void 0;
    this._front = (front + 1) & (this._capacity - 1);
    this._length--;
    return ret;
};

Queue.prototype.length = function Queue$length() {
    return this._length;
};

Queue.prototype._makeCapacity = function Queue$_makeCapacity() {
    var len = this._capacity;
    for (var i = 0; i < len; ++i) {
        this[i] = void 0;
    }
};

Queue.prototype._checkCapacity = function Queue$_checkCapacity(size) {
    if (this._capacity < size) {
        this._resizeTo(this._capacity << 3);
    }
};

Queue.prototype._resizeTo = function Queue$_resizeTo(capacity) {
    var oldFront = this._front;
    var oldCapacity = this._capacity;
    var oldQueue = new Array(oldCapacity);
    var length = this.length();

    arrayCopy(this, 0, oldQueue, 0, oldCapacity);
    this._capacity = capacity;
    this._makeCapacity();
    this._front = 0;
    if (oldFront + length <= oldCapacity) {
        arrayCopy(oldQueue, oldFront, this, 0, length);
    } else {        var lengthBeforeWrapping =
            length - ((oldFront + length) & (oldCapacity - 1));

        arrayCopy(oldQueue, oldFront, this, 0, lengthBeforeWrapping);
        arrayCopy(oldQueue, 0, this, lengthBeforeWrapping,
                    length - lengthBeforeWrapping);
    }
};

module.exports = Queue;

},{}],29:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL, cast) {
var apiRejection = require("./errors_api_rejection.js")(Promise);
var isArray = require("./util.js").isArray;

var raceLater = function Promise$_raceLater(promise) {
    return promise.then(function(array) {
        return Promise$_Race(array, promise);
    });
};

var hasOwn = {}.hasOwnProperty;
function Promise$_Race(promises, parent) {
    var maybePromise = cast(promises, void 0);

    if (maybePromise instanceof Promise) {
        return raceLater(maybePromise);
    } else if (!isArray(promises)) {
        return apiRejection("expecting an array, a promise or a thenable");
    }

    var ret = new Promise(INTERNAL);
    if (parent !== void 0) {
        ret._propagateFrom(parent, 7);
    } else {
        ret._setTrace(void 0);
    }
    var fulfill = ret._fulfill;
    var reject = ret._reject;
    for (var i = 0, len = promises.length; i < len; ++i) {
        var val = promises[i];

        if (val === void 0 && !(hasOwn.call(promises, i))) {
            continue;
        }

        Promise.cast(val)._then(fulfill, reject, void 0, ret, null);
    }
    return ret;
}

Promise.race = function Promise$Race(promises) {
    return Promise$_Race(promises, void 0);
};

Promise.prototype.race = function Promise$race() {
    return Promise$_Race(this, void 0);
};

};

},{"./errors_api_rejection.js":14,"./util.js":38}],30:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray, apiRejection, cast, INTERNAL) {
var util = require("./util.js");
var tryCatch4 = util.tryCatch4;
var tryCatch3 = util.tryCatch3;
var errorObj = util.errorObj;
function ReductionPromiseArray(promises, fn, accum, _each) {
    this.constructor$(promises);
    this._preservedValues = _each === INTERNAL ? [] : null;
    this._zerothIsAccum = (accum === void 0);
    this._gotAccum = false;
    this._reducingIndex = (this._zerothIsAccum ? 1 : 0);
    this._valuesPhase = undefined;

    var maybePromise = cast(accum, void 0);
    var rejected = false;
    var isPromise = maybePromise instanceof Promise;
    if (isPromise) {
        if (maybePromise.isPending()) {
            maybePromise._proxyPromiseArray(this, -1);
        } else if (maybePromise.isFulfilled()) {
            accum = maybePromise.value();
            this._gotAccum = true;
        } else {
            maybePromise._unsetRejectionIsUnhandled();
            this._reject(maybePromise.reason());
            rejected = true;
        }
    }
    if (!(isPromise || this._zerothIsAccum)) this._gotAccum = true;
    this._callback = fn;
    this._accum = accum;
    if (!rejected) this._init$(void 0, -5);
}
util.inherits(ReductionPromiseArray, PromiseArray);

ReductionPromiseArray.prototype._init =
function ReductionPromiseArray$_init() {};

ReductionPromiseArray.prototype._resolveEmptyArray =
function ReductionPromiseArray$_resolveEmptyArray() {
    if (this._gotAccum || this._zerothIsAccum) {
        this._resolve(this._preservedValues !== null
                        ? [] : this._accum);
    }
};

ReductionPromiseArray.prototype._promiseFulfilled =
function ReductionPromiseArray$_promiseFulfilled(value, index) {
    var values = this._values;
    if (values === null) return;
    var length = this.length();
    var preservedValues = this._preservedValues;
    var isEach = preservedValues !== null;
    var gotAccum = this._gotAccum;
    var valuesPhase = this._valuesPhase;
    var valuesPhaseIndex;
    if (!valuesPhase) {
        valuesPhase = this._valuesPhase = Array(length);
        for (valuesPhaseIndex=0; valuesPhaseIndex<length; ++valuesPhaseIndex) {
            valuesPhase[valuesPhaseIndex] = 0;
        }
    }
    valuesPhaseIndex = valuesPhase[index];

    if (index === 0 && this._zerothIsAccum) {
        if (!gotAccum) {
            this._accum = value;
            this._gotAccum = gotAccum = true;
        }
        valuesPhase[index] = ((valuesPhaseIndex === 0)
            ? 1 : 2);
    } else if (index === -1) {
        if (!gotAccum) {
            this._accum = value;
            this._gotAccum = gotAccum = true;
        }
    } else {
        if (valuesPhaseIndex === 0) {
            valuesPhase[index] = 1;
        }
        else {
            valuesPhase[index] = 2;
            if (gotAccum) {
                this._accum = value;
            }
        }
    }
    if (!gotAccum) return;

    var callback = this._callback;
    var receiver = this._promise._boundTo;
    var ret;

    for (var i = this._reducingIndex; i < length; ++i) {
        valuesPhaseIndex = valuesPhase[i];
        if (valuesPhaseIndex === 2) {
            this._reducingIndex = i + 1;
            continue;
        }
        if (valuesPhaseIndex !== 1) return;

        value = values[i];
        if (value instanceof Promise) {
            if (value.isFulfilled()) {
                value = value._settledValue;
            } else if (value.isPending()) {
                return;
            } else {
                value._unsetRejectionIsUnhandled();
                return this._reject(value.reason());
            }
        }

        if (isEach) {
            preservedValues.push(value);
            ret = tryCatch3(callback, receiver, value, i, length);
        }
        else {
            ret = tryCatch4(callback, receiver, this._accum, value, i, length);
        }

        if (ret === errorObj) return this._reject(ret.e);

        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            if (maybePromise.isPending()) {
                valuesPhase[i] = 4;
                return maybePromise._proxyPromiseArray(this, i);
            } else if (maybePromise.isFulfilled()) {
                ret = maybePromise.value();
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                return this._reject(maybePromise.reason());
            }
        }

        this._reducingIndex = i + 1;
        this._accum = ret;
    }

    if (this._reducingIndex < length) return;
    this._resolve(isEach ? preservedValues : this._accum);
};

function reduce(promises, fn, initialValue, _each) {
    if (typeof fn !== "function") return apiRejection("fn must be a function");
    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
    return array.promise();
}

Promise.prototype.reduce = function Promise$reduce(fn, initialValue) {
    return reduce(this, fn, initialValue, null);
};

Promise.reduce = function Promise$Reduce(promises, fn, initialValue, _each) {
    return reduce(promises, fn, initialValue, _each);
};
};

},{"./util.js":38}],31:[function(require,module,exports){
(function (process){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var schedule;
var _MutationObserver;
if (typeof process === "object" && typeof process.version === "string") {
    schedule = function Promise$_Scheduler(fn) {
        process.nextTick(fn);
    };
}
else if ((typeof MutationObserver !== "undefined" &&
         (_MutationObserver = MutationObserver)) ||
         (typeof WebKitMutationObserver !== "undefined" &&
         (_MutationObserver = WebKitMutationObserver))) {
    schedule = (function() {
        var div = document.createElement("div");
        var queuedFn = void 0;
        var observer = new _MutationObserver(
            function Promise$_Scheduler() {
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
            }
       );
        observer.observe(div, {
            attributes: true
        });
        return function Promise$_Scheduler(fn) {
            queuedFn = fn;
            div.classList.toggle("foo");
        };

    })();
}
else if (typeof setTimeout !== "undefined") {
    schedule = function Promise$_Scheduler(fn) {
        setTimeout(fn, 0);
    };
}
else throw new Error("no async scheduler available");
module.exports = schedule;

}).call(this,require('_process'))
},{"_process":39}],32:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports =
    function(Promise, PromiseArray) {
var PromiseInspection = Promise.PromiseInspection;
var util = require("./util.js");

function SettledPromiseArray(values) {
    this.constructor$(values);
}
util.inherits(SettledPromiseArray, PromiseArray);

SettledPromiseArray.prototype._promiseResolved =
function SettledPromiseArray$_promiseResolved(index, inspection) {
    this._values[index] = inspection;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
    }
};

SettledPromiseArray.prototype._promiseFulfilled =
function SettledPromiseArray$_promiseFulfilled(value, index) {
    if (this._isResolved()) return;
    var ret = new PromiseInspection();
    ret._bitField = 268435456;
    ret._settledValue = value;
    this._promiseResolved(index, ret);
};
SettledPromiseArray.prototype._promiseRejected =
function SettledPromiseArray$_promiseRejected(reason, index) {
    if (this._isResolved()) return;
    var ret = new PromiseInspection();
    ret._bitField = 134217728;
    ret._settledValue = reason;
    this._promiseResolved(index, ret);
};

Promise.settle = function Promise$Settle(promises) {
    return new SettledPromiseArray(promises).promise();
};

Promise.prototype.settle = function Promise$settle() {
    return new SettledPromiseArray(this).promise();
};
};

},{"./util.js":38}],33:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports =
function(Promise, PromiseArray, apiRejection) {
var util = require("./util.js");
var RangeError = require("./errors.js").RangeError;
var AggregateError = require("./errors.js").AggregateError;
var isArray = util.isArray;


function SomePromiseArray(values) {
    this.constructor$(values);
    this._howMany = 0;
    this._unwrap = false;
    this._initialized = false;
}
util.inherits(SomePromiseArray, PromiseArray);

SomePromiseArray.prototype._init = function SomePromiseArray$_init() {
    if (!this._initialized) {
        return;
    }
    if (this._howMany === 0) {
        this._resolve([]);
        return;
    }
    this._init$(void 0, -5);
    var isArrayResolved = isArray(this._values);
    if (!this._isResolved() &&
        isArrayResolved &&
        this._howMany > this._canPossiblyFulfill()) {
        this._reject(this._getRangeError(this.length()));
    }
};

SomePromiseArray.prototype.init = function SomePromiseArray$init() {
    this._initialized = true;
    this._init();
};

SomePromiseArray.prototype.setUnwrap = function SomePromiseArray$setUnwrap() {
    this._unwrap = true;
};

SomePromiseArray.prototype.howMany = function SomePromiseArray$howMany() {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany =
function SomePromiseArray$setHowMany(count) {
    if (this._isResolved()) return;
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled =
function SomePromiseArray$_promiseFulfilled(value) {
    if (this._isResolved()) return;
    this._addFulfilled(value);
    if (this._fulfilled() === this.howMany()) {
        this._values.length = this.howMany();
        if (this.howMany() === 1 && this._unwrap) {
            this._resolve(this._values[0]);
        } else {
            this._resolve(this._values);
        }
    }

};
SomePromiseArray.prototype._promiseRejected =
function SomePromiseArray$_promiseRejected(reason) {
    if (this._isResolved()) return;
    this._addRejected(reason);
    if (this.howMany() > this._canPossiblyFulfill()) {
        var e = new AggregateError();
        for (var i = this.length(); i < this._values.length; ++i) {
            e.push(this._values[i]);
        }
        this._reject(e);
    }
};

SomePromiseArray.prototype._fulfilled = function SomePromiseArray$_fulfilled() {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function SomePromiseArray$_rejected() {
    return this._values.length - this.length();
};

SomePromiseArray.prototype._addRejected =
function SomePromiseArray$_addRejected(reason) {
    this._values.push(reason);
};

SomePromiseArray.prototype._addFulfilled =
function SomePromiseArray$_addFulfilled(value) {
    this._values[this._totalResolved++] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill =
function SomePromiseArray$_canPossiblyFulfill() {
    return this.length() - this._rejected();
};

SomePromiseArray.prototype._getRangeError =
function SomePromiseArray$_getRangeError(count) {
    var message = "Input array must contain at least " +
            this._howMany + " items but contains only " + count + " items";
    return new RangeError(message);
};

SomePromiseArray.prototype._resolveEmptyArray =
function SomePromiseArray$_resolveEmptyArray() {
    this._reject(this._getRangeError(0));
};

function Promise$_Some(promises, howMany) {
    if ((howMany | 0) !== howMany || howMany < 0) {
        return apiRejection("expecting a positive integer");
    }
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    if (promise.isRejected()) {
        return promise;
    }
    ret.setHowMany(howMany);
    ret.init();
    return promise;
}

Promise.some = function Promise$Some(promises, howMany) {
    return Promise$_Some(promises, howMany);
};

Promise.prototype.some = function Promise$some(howMany) {
    return Promise$_Some(this, howMany);
};

Promise._SomePromiseArray = SomePromiseArray;
};

},{"./errors.js":13,"./util.js":38}],34:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
function PromiseInspection(promise) {
    if (promise !== void 0) {
        this._bitField = promise._bitField;
        this._settledValue = promise.isResolved()
            ? promise._settledValue
            : void 0;
    }
    else {
        this._bitField = 0;
        this._settledValue = void 0;
    }
}

PromiseInspection.prototype.isFulfilled =
Promise.prototype.isFulfilled = function Promise$isFulfilled() {
    return (this._bitField & 268435456) > 0;
};

PromiseInspection.prototype.isRejected =
Promise.prototype.isRejected = function Promise$isRejected() {
    return (this._bitField & 134217728) > 0;
};

PromiseInspection.prototype.isPending =
Promise.prototype.isPending = function Promise$isPending() {
    return (this._bitField & 402653184) === 0;
};

PromiseInspection.prototype.value =
Promise.prototype.value = function Promise$value() {
    if (!this.isFulfilled()) {
        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise");
    }
    return this._settledValue;
};

PromiseInspection.prototype.error =
PromiseInspection.prototype.reason =
Promise.prototype.reason = function Promise$reason() {
    if (!this.isRejected()) {
        throw new TypeError("cannot get rejection reason of a non-rejected promise");
    }
    return this._settledValue;
};

PromiseInspection.prototype.isResolved =
Promise.prototype.isResolved = function Promise$isResolved() {
    return (this._bitField & 402653184) > 0;
};

Promise.PromiseInspection = PromiseInspection;
};

},{}],35:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var util = require("./util.js");
var canAttach = require("./errors.js").canAttach;
var errorObj = util.errorObj;
var isObject = util.isObject;

function getThen(obj) {
    try {
        return obj.then;
    }
    catch(e) {
        errorObj.e = e;
        return errorObj;
    }
}

function Promise$_Cast(obj, originalPromise) {
    if (isObject(obj)) {
        if (obj instanceof Promise) {
            return obj;
        }
        else if (isAnyBluebirdPromise(obj)) {
            var ret = new Promise(INTERNAL);
            ret._setTrace(void 0);
            obj._then(
                ret._fulfillUnchecked,
                ret._rejectUncheckedCheckError,
                ret._progressUnchecked,
                ret,
                null
            );
            ret._setFollowing();
            return ret;
        }
        var then = getThen(obj);
        if (then === errorObj) {
            if (originalPromise !== void 0 && canAttach(then.e)) {
                originalPromise._attachExtraTrace(then.e);
            }
            return Promise.reject(then.e);
        } else if (typeof then === "function") {
            return Promise$_doThenable(obj, then, originalPromise);
        }
    }
    return obj;
}

var hasProp = {}.hasOwnProperty;
function isAnyBluebirdPromise(obj) {
    return hasProp.call(obj, "_promise0");
}

function Promise$_doThenable(x, then, originalPromise) {
    var resolver = Promise.defer();
    var called = false;
    try {
        then.call(
            x,
            Promise$_resolveFromThenable,
            Promise$_rejectFromThenable,
            Promise$_progressFromThenable
        );
    } catch(e) {
        if (!called) {
            called = true;
            var trace = canAttach(e) ? e : new Error(e + "");
            if (originalPromise !== void 0) {
                originalPromise._attachExtraTrace(trace);
            }
            resolver.promise._reject(e, trace);
        }
    }
    return resolver.promise;

    function Promise$_resolveFromThenable(y) {
        if (called) return;
        called = true;

        if (x === y) {
            var e = Promise._makeSelfResolutionError();
            if (originalPromise !== void 0) {
                originalPromise._attachExtraTrace(e);
            }
            resolver.promise._reject(e, void 0);
            return;
        }
        resolver.resolve(y);
    }

    function Promise$_rejectFromThenable(r) {
        if (called) return;
        called = true;
        var trace = canAttach(r) ? r : new Error(r + "");
        if (originalPromise !== void 0) {
            originalPromise._attachExtraTrace(trace);
        }
        resolver.promise._reject(r, trace);
    }

    function Promise$_progressFromThenable(v) {
        if (called) return;
        var promise = resolver.promise;
        if (typeof promise._progress === "function") {
            promise._progress(v);
        }
    }
}

return Promise$_Cast;
};

},{"./errors.js":13,"./util.js":38}],36:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var _setTimeout = function(fn, ms) {
    var len = arguments.length;
    var arg0 = arguments[2];
    var arg1 = arguments[3];
    var arg2 = len >= 5 ? arguments[4] : void 0;
    return setTimeout(function() {
        fn(arg0, arg1, arg2);
    }, ms|0);
};

module.exports = function(Promise, INTERNAL, cast) {
var util = require("./util.js");
var errors = require("./errors.js");
var apiRejection = require("./errors_api_rejection")(Promise);
var TimeoutError = Promise.TimeoutError;

var afterTimeout = function Promise$_afterTimeout(promise, message, ms) {
    if (!promise.isPending()) return;
    if (typeof message !== "string") {
        message = "operation timed out after" + " " + ms + " ms"
    }
    var err = new TimeoutError(message);
    errors.markAsOriginatingFromRejection(err);
    promise._attachExtraTrace(err);
    promise._cancel(err);
};

var afterDelay = function Promise$_afterDelay(value, promise) {
    promise._fulfill(value);
};

var delay = Promise.delay = function Promise$Delay(value, ms) {
    if (ms === void 0) {
        ms = value;
        value = void 0;
    }
    ms = +ms;
    var maybePromise = cast(value, void 0);
    var promise = new Promise(INTERNAL);

    if (maybePromise instanceof Promise) {
        promise._propagateFrom(maybePromise, 7);
        promise._follow(maybePromise);
        return promise.then(function(value) {
            return Promise.delay(value, ms);
        });
    } else {
        promise._setTrace(void 0);
        _setTimeout(afterDelay, ms, value, promise);
    }
    return promise;
};

Promise.prototype.delay = function Promise$delay(ms) {
    return delay(this, ms);
};

function successClear(value) {
    var handle = this;
    if (handle instanceof Number) handle = +handle;
    clearTimeout(handle);
    return value;
}

function failureClear(reason) {
    var handle = this;
    if (handle instanceof Number) handle = +handle;
    clearTimeout(handle);
    throw reason;
}

Promise.prototype.timeout = function Promise$timeout(ms, message) {
    ms = +ms;

    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 7);
    ret._follow(this);
    var handle = _setTimeout(afterTimeout, ms, ret, message, ms);
    return ret.cancellable()
              ._then(successClear, failureClear, void 0, handle, void 0);
};

};

},{"./errors.js":13,"./errors_api_rejection":14,"./util.js":38}],37:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function (Promise, apiRejection, cast) {
    var TypeError = require("./errors.js").TypeError;
    var inherits = require("./util.js").inherits;
    var PromiseInspection = Promise.PromiseInspection;

    function inspectionMapper(inspections) {
        var len = inspections.length;
        for (var i = 0; i < len; ++i) {
            var inspection = inspections[i];
            if (inspection.isRejected()) {
                return Promise.reject(inspection.error());
            }
            inspections[i] = inspection.value();
        }
        return inspections;
    }

    function thrower(e) {
        setTimeout(function(){throw e;}, 0);
    }

    function castPreservingDisposable(thenable) {
        var maybePromise = cast(thenable, void 0);
        if (maybePromise !== thenable &&
            typeof thenable._isDisposable === "function" &&
            typeof thenable._getDisposer === "function" &&
            thenable._isDisposable()) {
            maybePromise._setDisposable(thenable._getDisposer());
        }
        return maybePromise;
    }
    function dispose(resources, inspection) {
        var i = 0;
        var len = resources.length;
        var ret = Promise.defer();
        function iterator() {
            if (i >= len) return ret.resolve();
            var maybePromise = castPreservingDisposable(resources[i++]);
            if (maybePromise instanceof Promise &&
                maybePromise._isDisposable()) {
                try {
                    maybePromise = cast(maybePromise._getDisposer()
                                        .tryDispose(inspection), void 0);
                } catch (e) {
                    return thrower(e);
                }
                if (maybePromise instanceof Promise) {
                    return maybePromise._then(iterator, thrower,
                                              null, null, null);
                }
            }
            iterator();
        }
        iterator();
        return ret.promise;
    }

    function disposerSuccess(value) {
        var inspection = new PromiseInspection();
        inspection._settledValue = value;
        inspection._bitField = 268435456;
        return dispose(this, inspection).thenReturn(value);
    }

    function disposerFail(reason) {
        var inspection = new PromiseInspection();
        inspection._settledValue = reason;
        inspection._bitField = 134217728;
        return dispose(this, inspection).thenThrow(reason);
    }

    function Disposer(data, promise) {
        this._data = data;
        this._promise = promise;
    }

    Disposer.prototype.data = function Disposer$data() {
        return this._data;
    };

    Disposer.prototype.promise = function Disposer$promise() {
        return this._promise;
    };

    Disposer.prototype.resource = function Disposer$resource() {
        if (this.promise().isFulfilled()) {
            return this.promise().value();
        }
        return null;
    };

    Disposer.prototype.tryDispose = function(inspection) {
        var resource = this.resource();
        var ret = resource !== null
            ? this.doDispose(resource, inspection) : null;
        this._promise._unsetDisposable();
        this._data = this._promise = null;
        return ret;
    };

    Disposer.isDisposer = function Disposer$isDisposer(d) {
        return (d != null &&
                typeof d.resource === "function" &&
                typeof d.tryDispose === "function");
    };

    function FunctionDisposer(fn, promise) {
        this.constructor$(fn, promise);
    }
    inherits(FunctionDisposer, Disposer);

    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
        var fn = this.data();
        return fn.call(resource, resource, inspection);
    };

    Promise.using = function Promise$using() {
        var len = arguments.length;
        if (len < 2) return apiRejection(
                        "you must pass at least 2 arguments to Promise.using");
        var fn = arguments[len - 1];
        if (typeof fn !== "function") return apiRejection("fn must be a function");
        len--;
        var resources = new Array(len);
        for (var i = 0; i < len; ++i) {
            var resource = arguments[i];
            if (Disposer.isDisposer(resource)) {
                var disposer = resource;
                resource = resource.promise();
                resource._setDisposable(disposer);
            }
            resources[i] = resource;
        }

        return Promise.settle(resources)
            .then(inspectionMapper)
            .spread(fn)
            ._then(disposerSuccess, disposerFail, void 0, resources, void 0);
    };

    Promise.prototype._setDisposable =
    function Promise$_setDisposable(disposer) {
        this._bitField = this._bitField | 262144;
        this._disposer = disposer;
    };

    Promise.prototype._isDisposable = function Promise$_isDisposable() {
        return (this._bitField & 262144) > 0;
    };

    Promise.prototype._getDisposer = function Promise$_getDisposer() {
        return this._disposer;
    };

    Promise.prototype._unsetDisposable = function Promise$_unsetDisposable() {
        this._bitField = this._bitField & (~262144);
        this._disposer = void 0;
    };

    Promise.prototype.disposer = function Promise$disposer(fn) {
        if (typeof fn === "function") {
            return new FunctionDisposer(fn, this);
        }
        throw new TypeError();
    };

};

},{"./errors.js":13,"./util.js":38}],38:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var es5 = require("./es5.js");
var haveGetters = (function(){
    try {
        var o = {};
        es5.defineProperty(o, "f", {
            get: function () {
                return 3;
            }
        });
        return o.f === 3;
    }
    catch (e) {
        return false;
    }

})();
var canEvaluate = typeof navigator == "undefined";
var errorObj = {e: {}};
function tryCatch1(fn, receiver, arg) {
    try { return fn.call(receiver, arg); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch2(fn, receiver, arg, arg2) {
    try { return fn.call(receiver, arg, arg2); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch3(fn, receiver, arg, arg2, arg3) {
    try { return fn.call(receiver, arg, arg2, arg3); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch4(fn, receiver, arg, arg2, arg3, arg4) {
    try { return fn.call(receiver, arg, arg2, arg3, arg4); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatchApply(fn, args, receiver) {
    try { return fn.apply(receiver, args); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

var inherits = function(Child, Parent) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call(Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
           ) {
                this[propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};

function asString(val) {
    return typeof val === "string" ? val : ("" + val);
}

function isPrimitive(val) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject(value) {
    return !isPrimitive(value);
}

function maybeWrapAsError(maybeError) {
    if (!isPrimitive(maybeError)) return maybeError;

    return new Error(asString(maybeError));
}

function withAppended(target, appendee) {
    var len = target.length;
    var ret = new Array(len + 1);
    var i;
    for (i = 0; i < len; ++i) {
        ret[i] = target[i];
    }
    ret[i] = appendee;
    return ret;
}

function getDataPropertyOrDefault(obj, key, defaultValue) {
    if (es5.isES5) {
        var desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc != null) {
            return desc.get == null && desc.set == null
                    ? desc.value
                    : defaultValue;
        }
    } else {
        return {}.hasOwnProperty.call(obj, key) ? obj[key] : void 0;
    }
}

function notEnumerableProp(obj, name, value) {
    if (isPrimitive(obj)) return obj;
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    es5.defineProperty(obj, name, descriptor);
    return obj;
}


var wrapsPrimitiveReceiver = (function() {
    return this !== "string";
}).call("string");

function thrower(r) {
    throw r;
}

var inheritedDataKeys = (function() {
    if (es5.isES5) {
        return function(obj, opts) {
            var ret = [];
            var visitedKeys = Object.create(null);
            var getKeys = Object(opts).includeHidden
                ? Object.getOwnPropertyNames
                : Object.keys;
            while (obj != null) {
                var keys;
                try {
                    keys = getKeys(obj);
                } catch (e) {
                    return ret;
                }
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (visitedKeys[key]) continue;
                    visitedKeys[key] = true;
                    var desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (desc != null && desc.get == null && desc.set == null) {
                        ret.push(key);
                    }
                }
                obj = es5.getPrototypeOf(obj);
            }
            return ret;
        };
    } else {
        return function(obj) {
            var ret = [];
            /*jshint forin:false */
            for (var key in obj) {
                ret.push(key);
            }
            return ret;
        };
    }

})();

function isClass(fn) {
    try {
        if (typeof fn === "function") {
            var keys = es5.keys(fn.prototype);
            return keys.length > 0 &&
                   !(keys.length === 1 && keys[0] === "constructor");
        }
        return false;
    } catch (e) {
        return false;
    }
}

function toFastProperties(obj) {
    /*jshint -W027*/
    function f() {}
    f.prototype = obj;
    return f;
    eval(obj);
}

var rident = /^[a-z$_][a-z$_0-9]*$/i;
function isIdentifier(str) {
    return rident.test(str);
}

function filledRange(count, prefix, suffix) {
    var ret = new Array(count);
    for(var i = 0; i < count; ++i) {
        ret[i] = prefix + i + suffix;
    }
    return ret;
}

var ret = {
    isClass: isClass,
    isIdentifier: isIdentifier,
    inheritedDataKeys: inheritedDataKeys,
    getDataPropertyOrDefault: getDataPropertyOrDefault,
    thrower: thrower,
    isArray: es5.isArray,
    haveGetters: haveGetters,
    notEnumerableProp: notEnumerableProp,
    isPrimitive: isPrimitive,
    isObject: isObject,
    canEvaluate: canEvaluate,
    errorObj: errorObj,
    tryCatch1: tryCatch1,
    tryCatch2: tryCatch2,
    tryCatch3: tryCatch3,
    tryCatch4: tryCatch4,
    tryCatchApply: tryCatchApply,
    inherits: inherits,
    withAppended: withAppended,
    asString: asString,
    maybeWrapAsError: maybeWrapAsError,
    wrapsPrimitiveReceiver: wrapsPrimitiveReceiver,
    toFastProperties: toFastProperties,
    filledRange: filledRange
};

module.exports = ret;

},{"./es5.js":15}],39:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],40:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Image Asset Definition
 * @author: Joe Harlow
 *
 */

/*
 *  arrayBufferToBase64 [private] - Convert Array Buffer to Base64 encode.
 *  @param {arrayBuffer} - The files array buffer.
 *
 *  @return {string} - The Base64 encoded image.
 */
function arrayBufferToBase64(arrayBuffer) {
    var base64    = '';
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var bytes         = new Uint8Array(arrayBuffer);
    var byteLength    = bytes.byteLength;
    var byteRemainder = byteLength % 3;
    var mainLength    = byteLength - byteRemainder;

    var a, b, c, d;
    var chunk;

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
     
        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63;               // 63       = 2^6 - 1
     
        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];
     
        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
     
        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4; // 3   = 2^2 - 1
     
        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
     
        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4
     
        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2; // 15    = 2^4 - 1
     
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
}

/*
 *  ImageAsset - Buffer Loader transformation function.
 *  @param {src} - File URL.
 *  @param {res} - XHR ArrayBuffer response.
 *  @param {next} - Function to carry on the Buffer Loader after transformation.
 */
var ImageAsset = function(src, res, next) {

    var buffer, isLoaded = false;
    var ret = {
        uri: function() {
            return src;
        },
        source: src
    };

    if (res && next) {
        var filetype = /\.(\w+)$/.exec(src)[1];
        buffer = 'data:image/' + filetype + ';base64,' + arrayBufferToBase64(res);
        ret.uri = function() {
            return buffer;
        };
        isLoaded = true;
        next(ret);
    } else {
        return ret;
    }

};

module.exports = ImageAsset;
},{}],41:[function(require,module,exports){
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
    soundRegex = /\.(mp3|mp4|ogg)$/;

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
},{"./image":40,"./loader":42,"./sound":44,"bluebird":6}],42:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Buffer Loader
 * @author: Joe Harlow
 *
 */

/* Import modules */
var Promise = require('bluebird'); // https://github.com/petkaantonov/bluebird

/*
 *  BufferLoader [constructor] - Create a new BufferLoader instance.
 *  @param {files} - An Array on files to load.
 *  @param {transform} - A function to transform the loader response.
 */
var BufferLoader = function(files, transform) {
    this.files = files;
    this.transform = transform || function(url, res, next) {
        return next(res);
    };
};

/*
 *  BufferLoader.prototype.loadBuffer - Load an individual buffer.
 *  @param {url} - A string of the URL to load.
 *
 *  @return {Promise} - A Promise that resolves when the loader completes.
 */
BufferLoader.prototype.loadBuffer = function(url) {
    var _self = this;

    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'arraybuffer';
        req.onload = function() {
            /* Transform the XHR response */
            _self.transform(url, req.response, function(transformResponse) {
                resolve(transformResponse);
            });
        };
        req.onerror = reject;
        req.send();
    });

};

/*
 *  BufferLoader.prototype.load - Load all the buffers in the file list.
 *
 *  @return {Promise} - A Promise that resolves when the all the loaders complete.
 */
BufferLoader.prototype.load = function() {
    var _self = this;

    var promises = _self.files.map(function(src) {
        return _self.loadBuffer(src);
    });

    return Promise.all(promises);
};

module.exports = BufferLoader;
},{"bluebird":6}],43:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Audio Context Wrapper
 * @author: Joe Harlow
 *
 */

module.exports = window.AudioContext || window.webAudioContext || window.webkitAudioContext;
},{}],44:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Sound Asset Definition
 * @author: Joe Harlow
 *
 */

/* Import modules */
var AudioContext = require('./context');

var context = new AudioContext();

/*
 *  Sound - Buffer Loader transformation function.
 *  @param {src} - File URL.
 *  @param {res} - XHR ArrayBuffer response.
 *  @param {next} - Function to carry on the Buffer Loader after transformation.
 */
function Sound(src, res, next) {

	var buffer, isLoaded = false;
	var ret = {
		play: function() {
			if (!isLoaded) return;
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.onended = function() {
				source = null;
			};
			source.connect(context.destination);
			source.start(0);
		},
		source: src
	};

	if (res && next) {
		context.decodeAudioData(res, function(buff) {
			buffer = buff;
			isLoaded = true;
			next(ret);
		});
	} else {
		return ret;
	}

}

module.exports = Sound;


},{"./context":43}],45:[function(require,module,exports){
var $ = require('../utilities');
var Interpol = require('interpol');
var Config = require('../config');

var AssetManager = require('../assetmanager');

var Particle = {
    x: 0, y: 0,
    sx: 0, sy: 0,
    vx: 0, vy: 0,
    radius: 10, color: '#ffffff'
};

Particle.init = function(x, y, vx, vy, radius, color) {
    this.x = x || this.x;
    this.y = y || this.y;
    this.sx = x || this.x;
    this.sy = y || this.y;
    this.vx = vx || this.vx;
    this.vy = vy || this.vy;
    this.radius = radius || this.radius;
    this.color = color || this.color;
};

Particle.update = function(width, height, vx, vy) {
    this.x += this.vx + (vx || 0);
    this.y += this.vy + (vy || 0);
    if (this.x < -(this.radius) || (this.x - this.radius) > width || this.y < -(this.radius) || (this.y - this.radius) > height) {
        this.x = this.sx;
        this.y = this.sy;
    }
};

var ParticleSystem = {
    particles: []
};

ParticleSystem.init = function(numOfParticles, startX, startY) {
    this.particles = [];

    for (var i = 0; i < numOfParticles; i++) {
        var particle = Object.create(Particle);
        particle.init(
            startX,
            startY,
            $.floatRange(-1, 1),
            $.floatRange(-1, 1),
            $.floatRange(15, 30),
            'rgba(' + $.range(0, 255) + ',' + $.range(0, 255) + ',' + $.range(0, 255) + ',' + $.floatRange(0.1, 0.7) + ')'
        );
        this.particles.push(particle);
    }

};


var Background = {
    target: undefined,
    canvas: undefined,
    context: undefined,
    system: undefined
};

Background.init = function(target) {
    var _self = this;
    _self.target = target;

    _self.canvas = document.createElement('canvas');

    var setDimensions = (function sD() {
        _self.canvas.width = $.windowWidth();
        _self.canvas.height = $.windowHeight();
        return sD;
    })();

    _self.system = Object.create(ParticleSystem);
    _self.system.init(250, _self.canvas.width / 2, _self.canvas.height / 2);

    window.addEventListener('resize', setDimensions);

    _self.target.appendChild(_self.canvas);
    _self.context = _self.canvas.getContext('2d');

    if (Config.global.useBackgroundAnimation) Interpol.pipeline.add('background', _self.render.bind(_self));

    $.emitter.on('global_config_change', function(key, value) {
        if (key === 'useBackgroundAnimation') {
            if (value && !Interpol.pipeline.has('background')) {
                Interpol.pipeline.add('background', _self.render.bind(_self));
            } else if (Interpol.pipeline.has('background')) {
                Interpol.pipeline.remove('background');
                _self.context.clearRect(0, 0, _self.canvas.width, _self.canvas.height);
            }
        }
    });
};

Background.render = function() {
    // console.log(this.context);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var img = new Image();
    img.src = AssetManager.get('assets/img/playlogo-sml.png').uri();

    for (var i = 0; i < this.system.particles.length; i++) {
        var particle = this.system.particles[i];
        particle.update(this.canvas.width, this.canvas.height);
        //particle.update(this.canvas.width, this.canvas.height, $.floatRange(-1, 1), $.floatRange(-1, 0));

        this.context.drawImage(img, particle.x, particle.y, particle.radius, particle.radius);

        // this.context.beginPath();
        // this.context.fillStyle = particle.color;
        // this.context.arc(particle.x,particle.y,particle.radius,0,Math.PI*2,true);
        // this.context.fill();
    }
};

Background.remove = function() {
    this.target.removeChild(this.canvas);
    Interpol.pipeline.remove('background');
};

module.exports = Background;
},{"../assetmanager":41,"../config":46,"../utilities":58,"interpol":2}],46:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Configuration
 * @author: Joe Harlow
 *
 */

/* General Utilites */
var $ = require('./utilities');

var BASE_URL = 'http://labs.f5.io/essence/';

var global = {};

/* Let's define some global configuration options that will emit an event when they are set */
['displayMetrics', 'useSound', 'useAccelerometer', 'useGamification', 'useDynamicLighting', 'useBackgroundAnimation', 'useMessaging', 'isCeltra'].forEach(function(key) {
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
// global.useGamification = true;
global.useAccelerometer = true;
global.useDynamicLighting = true;

/* Individual cube specific configuration variables */
var cube = {
    castShadow: true,
    useInertia: false,
    useBackgrounds: true,
    useContent: false,
    useVideo: false,
    useGif: false,
    cropLargeFaces: false,
    isSequential: false,
    normaliseFacialRotation: true
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
    cropLargeFaces: 'Crop Full Face Assets',
    isSequential: 'Sequential Interaction',
    normaliseFacialRotation: 'Normalise Face Rotation',
    isCeltra: 'Celtra Platform',
    castShadow: 'Cast Shadow'
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
    cropLargeFaces: 'Use the full face assets on the gamified cube to reduce ad weight.',
    isSequential: 'Always display the next face of the cube no matter which way it turns.',
    normaliseFacialRotation: 'Always display cube faces at the correct orientation.',
    isCeltra: 'Will be green if we are in Celtra.',
    castShadow: 'Cast a shadow underneath the cube.'
};

/* Let's expose these objects */
module.exports = {
    BASE_URL: BASE_URL,
    global: global,
    cube: cube,
    titles: titles,
    descriptions: descriptions
};
},{"./utilities":58}],47:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Cube Component Base Class
 * @author: Joe Harlow
 *
 */

/* General Utilites */
var $ = require('../utilities');

/* Define the common component functions which will be `super`ed by the component classes */
var Common = {
    /*
     *  init - Initialise the component.
     *  @param {width} - A number for the width of the component.
     *  @param {height} - A number for the height of the component.
     *  @param {index} - A number for the index of the component.
     *  @param {name} - A string to of the name of the component.
     *  @param {target} - An HTML Element where the component will be appended.
     */
    init: function(width, height, index, name, target) {
        this.id = Math.random().toString(36).substr(5, 10);
        this.width = width;
        this.height = height;
        this.index = index;
        this.name = name;
        this.target = target;
        this.rotation = {
            X: 0, Y: 0, Z: 0
        };
        this.translate = {
            X: 0, Y: 0, Z: 0
        };
        this.element = this.getElement();
        this.target.appendChild(this.element);
    },
    /*
     *  getElement - A function to get the component element, to be overridden.
     *
     *  @return {HTMLElement} - A HTML Element.
     */
    getElement: function() {
        return $.getElement('div', 'common', {}, {});
    },
    /*
     *  render - Render the components `element` with CSS transformation.
     */
    render: function() {
        this.element.style[$.CSS_TRANSFORM] = 'rotateX(' + this.rotation.X + 'deg) ' +
            'rotateY(' + this.rotation.Y + 'deg) ' +
            'rotateZ(' + this.rotation.Z + 'deg) ' +
            'translateX(' + this.translate.X + 'px) ' +
            'translateY(' + this.translate.Y + 'px) ' +
            'translateZ(' + this.translate.Z + 'px)';
    },
    /*
     *  remove - Remove the components `element` from it's `target`.
     */
    remove: function() {
        this.element.parentNode.removeChild(this.element);
    }
};

module.exports = Common;
},{"../utilities":58}],48:[function(require,module,exports){
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
		cube01 : [ /* Array of sides with `html` and `onload` functions */
			{
				html: function(cfg) {
					return '<img class="logo" src="' + AssetManager.get(pre + 'assets/img/side-music.jpg').uri() + '"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/music5.png').uri() + '"/>' +
								'</span>' +
								'<h1>In the Silence (Deluxe Edition)</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/music5.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/music4.png').uri() + '"/>' +
								'</span>' +
								'<h1>BBC Music Awards</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/music4.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/music3.png').uri() + '"/>' +
								'</span>' +
								'<h1>Reclassified</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/music3.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/music2.png').uri() + '"/>' +
								'</span>' +
								'<h1>III (Deluxe)</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/music2.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/music1.png').uri() + '"/>' +
								'</span>' +
								'<h1>Bastille vs. Other People\'s Heartache</h1>' +
							'</div>' +
							'<div class="content-below music">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/music1.jpg').uri() + '" />' +
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
					return '<img class="logo" src="' + AssetManager.get(pre + 'assets/img/side-books.jpg').uri() + '"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/book5.png').uri() + '"/>' +
								'</span>' +
								'<h1>The Fault in Our Stars</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/book5.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/book4.png').uri() + '"/>' +
								'</span>' +
								'<h1>Nikola Tesla: Imagination...</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/book4.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/book3.png').uri() + '"/>' +
								'</span>' +
								'<h1>Tell No One</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/book3.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/book2.png').uri() + '"/>' +
								'</span>' +
								'<h1>Where There\'s Smoke</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/book2.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/book1.png').uri() + '"/>' +
								'</span>' +
								'<h1>Christmas at the Cupcake Cafe</h1>' +
							'</div>' +
							'<div class="content-below books">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/book1.jpg').uri() + '" />' +
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
					return '<img class="logo" src="' + AssetManager.get(pre + 'assets/img/side-apps.jpg').uri() + '"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/apps5.png').uri() + '"/>' +
								'</span>' +
								'<h1>Soundcloud - Music and Audio</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/apps5.png').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/apps4.png').uri() + '"/>' +
								'</span>' +
								'<h1>Twitter</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/apps4.png').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/apps3.png').uri() + '"/>' +
								'</span>' +
								'<h1>Chrome Browser - Google</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/apps3.png').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/apps2.png').uri() + '"/>' +
								'</span>' +
								'<h1>Skype</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/apps2.png').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/apps1.png').uri() + '"/>' +
								'</span>' +
								'<h1>Instagram</h1>' +
							'</div>' +
							'<div class="content-below apps">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/apps1.png').uri() + '" />' +
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
					return '<img class="logo" src="' + AssetManager.get(pre + 'assets/img/side-movies.jpg').uri() + '"/>';
				},
				onload: function(el, cfg) {}
			},
			{
				html: function(cfg) {
					return '<div class="title n5">' +
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/movies5.png').uri() + '"/>' +
								'</span>' +
								'<h1>Gods Pocket</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/movies5.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/movies4.png').uri() + '"/>' +
								'</span>' +
								'<h1>Dawn of the Planet of the Apes</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/movies4.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/movies3.png').uri() + '"/>' +
								'</span>' +
								'<h1>By the Gun</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/movies3.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/movies2.png').uri() + '"/>' +
								'</span>' +
								'<h1>I am Ali</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/movies2.jpg').uri() + '" />' +
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
								'<span class="number">' +
									'<img src="' + AssetManager.get(pre + 'assets/img/content/numbers/movies1.png').uri() + '"/>' +
								'</span>' +
								'<h1>The Inbetweeners Movie 2</h1>' +
							'</div>' +
							'<div class="content-below movies">' +
								'<img src="' + AssetManager.get(pre + 'assets/img/content/covers/movies1.jpg').uri() + '" />' +
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
},{"../../assetmanager":41,"../../config":46,"../../messaging":56,"../../utilities":58}],49:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Face Class
 * @author: Joe Harlow
 *
 */

/* General Utilities */
var $ = require('../utilities');

/* Import modules */
var Common = require('./common');
var content = require('./content');
var Config = require('../config');
var AssetManager = require('../assetmanager');

/* Inherit from the Cube Component Base Class */
var Face = Object.create(Common);

/*
 *  Face.init - Override `init` on the Base Class.
 *  @param {width} - A number for the width of the component.
 *  @param {height} - A number for the height of the component.
 *  @param {index} - A number for the index of the component.
 *  @param {name} - A string to of the name of the component.
 *  @param {target} - An HTML Element where the component will be appended.
 *  @param {parent} - The Face's parent `Cube`.
 */
Face.init = function(width, height, index, name, target, parent) {
    this.parent = parent;
    this.parentID = parent.id;

    /* `super` the Base Class */
    Common.init.apply(this, arguments);

    this.element.setAttribute('parent', this.parentID);
    this.translate.Z = this.width / 2;
    this.renderedZ = this.rotation.Z;
};

/*
 *  Face.getElement - Override `getElement` on the Base Class.
 *
 *  @return {HTMLElement} - A HTML Element.
 */
Face.getElement = function() {
    return this.populateElement(
        $.getElement(
            'div',
            'side no' + (this.index + 1),
            {
                index : this.index
            },
            {
                width : this.width + 'px',
                height: this.height + 'px'
            }
        )
    );
};

/*
 *  Face.populateElement - Populate a Face element with content.
 *  @param {elem} - An HTML Element to be populated.
 *
 *  @return {HTMLElement} - The populated HTML Element.
 */
Face.populateElement = function(elem) {
    var c = content.sides[this.name][this.index];
    
    if (this.parent.config.useBackgrounds) {
        var img = new Image();
        var name = this.parent.config.cropLargeFaces ? 'main' : this.name;
        var str = Config.global.isCeltra ? Config.BASE_URL + content.background : content.background;
        var url = $.format(str, { i: this.index + 1, name: name });
        img.src = AssetManager.get(url).uri();
        img.width = this.width;
        img.height = this.height;
        
        if (this.parent.config.cropLargeFaces) {
            img.width *= 2;
            img.height *= 2;
            img.style.left = $.isOdd(this.parent.index) ? -this.width + 'px' : 0;
            img.style.top = this.parent.index < 2 ? 0 : -this.height + 'px';
        }

        elem.appendChild(img);
    }

    if (this.parent.config.useContent) {
        var span = document.createElement('span');
        span.className = 'content';
        span.innerHTML = c.html(this.parent.config);

        elem.appendChild(span);

        c.onload(elem, this.parent.config);
    }

    var shadow = document.createElement('div');
    shadow.className = 'shadow';
    shadow.style.width = this.width + 'px';
    shadow.style.height = this.height + 'px';

    elem.appendChild(shadow);

    return elem;
};

/*
 *  Face.changeContent - Populate a Face element with content from a specific `index` in the content matrix.
 *  @param {index} - An HTML Element to be populated.
 *
 *  @return {integer} - The index transformed accordingly for Matrix length.
 */
Face.changeContent = function(index) {
    index = index >= content.sides[this.name].length ? 0 : index;
    var c = content.sides[this.name][index];

    if (this.parent.config.useBackgrounds) {
        var img = $('img', this.element)[0];
        var str = Config.global.isCeltra ? Config.BASE_URL + content.background : content.background;
        var url = $.format(str, { i: index + 1, name: this.name });
        img.src = AssetManager.get(url).uri();
    }

    if (this.parent.config.useContent) {
        var span = $('.content', this.element)[0];
        span.innerHTML = c.html(this.parent.config);

        c.onload(this.element, this.parent.config);
    }

    return index;
};

/*
 *  Face.render - Override `render` on the Base Class.
 */
Face.render = function() {
    this.renderedZ = this.rotation.Z;

    /* `super` the Base Class */
    Common.render.apply(this);
};

module.exports = Face;


},{"../assetmanager":41,"../config":46,"../utilities":58,"./common":47,"./content":48}],50:[function(require,module,exports){
var $ = require('../utilities');
var content = require('./content');
var Config = require('../config');
var Vect3 = require('./vect3');
var AssetManager = require('../assetmanager');


var Interpol = require('interpol');


var Fold = {
    init: function(cube, faceIndex) {
        this.cube = cube;
        this.width = cube.width;
        this.height = cube.height;
        this.target = cube.target;
        this.faceIndex = faceIndex;
        this.cubeIndex = cube.index;
        this.cubeRotation = cube.rotation;
        this.folds = [];

        var styles = {
            width: this.width * 2 + 'px',
            height: this.height * 2 + 'px'
        };

        styles[$.CSS_TRANSFORM] = 'translateZ(' + Math.ceil(this.width / 2) + 'px)';

        /* Select the `light` from DOM */
        this.light = $('[role="light"]')[0];
        
        /* The light never moves so define the `lightTransform` on `init` */
        this.lightTransform = $.getTransform(this.light);

        this.element = $.getElement('div', 'fold-container', {}, styles);
        this.target.appendChild(this.element);
        populateElement.call(this);

        function populateElement() {
            for (var i = 0; i < 4; i++) {
                var styles = {
                    left: $.isEven(i) ? 0 : this.width + 'px',
                    top: i > 1 ? this.height + 'px' : 0,
                    width: this.width + 'px',
                    height: this.height + 'px'
                };

                var transformOrigin = i === 0 ? '50% 100%' : i === 1 ? '0 50%' : i === 2 ? '100% 50%' : '50% 0',
                    startValue = i < 2 ? -91 : 91,
                    rotationAxis = i === 0 || i === 3 ? 'X' : 'Y';

                styles[$.CSS_TRANSFORM_ORIGIN] = transformOrigin;
                styles[$.CSS_TRANSFORM] = 'rotate' + rotationAxis + '(' + startValue + 'deg)';

                var fold = $.getElement('div', 'fold', {}, styles);

                var img = new Image();
                var str = Config.global.isCeltra ? Config.BASE_URL + content.background : content.background;
                var dict = { i : this.faceIndex + 1 };
                dict.name = this.cube.config.cropLargeFaces ? 'main' : 'cube0' + (i + 1);
                var src = $.format(str, dict);

                img.src = AssetManager.get(src).uri();
                img.width = this.width;
                img.height = this.height;

                if (this.cube.config.cropLargeFaces || this.cube.config.matchSides === false) {
                    img.width *= 2;
                    img.height *= 2;
                    img.style.left = $.isOdd(i + 1) ? 0 : -this.width + 'px';
                    img.style.top = i < 2 ? 0 : -this.height + 'px';
                }

                fold.appendChild(img);

                var shadow = $.getElement('div', 'shadow', {}, {});
                fold.appendChild(shadow);

                this.element.appendChild(fold);

                this.folds.push({
                    start: startValue,
                    axis: rotationAxis,
                    element: fold,
                    shadow: shadow
                });
            }
        }

        function animateFolds() {
            var _self = this;

            var indexes = [0, 1, 3, 2, 0, 1, 3, 2];
            indexes = indexes.splice(indexes.indexOf(this.cubeIndex), 4);

            indexes.forEach(function(index, i, arr) {
                var fold = _self.folds[index];
                if (i === 0 && _self.cube.config.matchSides !== false) {
                    fold.element.style[$.CSS_TRANSFORM] = 'rotate' + fold.axis + '(0deg)';
                    fold.shadow.style.opacity = 0;
                    return;
                }

                var time = 200;
                var delay = i * time;

                if (i === 0) {
                    delay = arr.length * time;
                }

                Interpol.tween()
                    .from(fold.start)
                    .to(0)
                    .delay(delay)
                    .duration(time)
                    .step(function(val) {
                        fold.element.style[$.CSS_TRANSFORM] = 'rotate' + fold.axis + '(' + val + 'deg)';

                        /* If no dynamic lighting, remove all shadows and exit this function */
                        if (!Config.global.useDynamicLighting) {
                            fold.shadow.style.opacity = 0;
                            return;
                        }

                        /* Dynamic Lighting */
                        var foldTransform = $.getTransform(fold.element),
                            lightPosition = Vect3.rotate(_self.lightTransform.translate, Vect3.muls(foldTransform.rotate, -1));

                        var verticies = $.computeVertexData(fold.element);
                        var center = Vect3.divs(Vect3.sub(verticies.c, verticies.a), 2);
                        var normal = Vect3.normalize(Vect3.cross(Vect3.sub(verticies.b, verticies.a), Vect3.sub(verticies.c, verticies.a)));

                        var direction = Vect3.normalize(Vect3.sub(lightPosition, center));
                        var amount = 0.75 - Math.max(0, Vect3.dot(normal, direction)).toFixed(3);

                        if (fold.light !== amount) {
                            fold.light = amount;
                            fold.shadow.style.opacity = amount;
                        }
                    })
                    .complete(function() {
                        var lenToCheck = _self.cube.config.matchSides === false ? 0 : arr.length - 1;
                        if (i === lenToCheck) $.emitter.emit('fold_out_complete', _self.cubeRotation);
                    })
                    .start(function() {
                        $.emitter.emit('fold_out_start', index, time * 0.5);
                    });

            });
        }

        animateFolds.call(this);
    }
};

module.exports = Fold;
},{"../assetmanager":41,"../config":46,"../utilities":58,"./content":48,"./vect3":54,"interpol":2}],51:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Cube Class
 * @author: Joe Harlow
 *
 */

/* General Utilities */
var $ = require('../utilities');

/* Import modules */
var Common = require('./common');
var matrix = require('./matrix');
var Face = require('./face');
var Shadow = require('./shadow');
var Fold = require('./fold');
var Config = require('../config');
var Interpol = require('interpol');
var AssetManager = require('../assetmanager');
var Vect3 = require('./vect3');

/* Inherit from the Cube Component Base Class */
var Cube = Object.create(Common);

/*
 *  Cube.getElement - Override `getElement` on the Base Class.
 *
 *  @return {HTMLElement} - A HTML Element.
 */
Cube.getElement = function() {
    return $.getElement('div', 'cube', { index: this.index }, {
        width: this.width + 'px',
        height: this.height + 'px'
    });
};

/*
 *  Cube.init - Override `init` on the Base Class.
 *  @param {width} - A number for the width of the component.
 *  @param {height} - A number for the height of the component.
 *  @param {index} - A number for the index of the component.
 *  @param {name} - A string to of the name of the component.
 *  @param {target} - An HTML Element where the component will be appended.
 *  @param {config} - An object containing the cubes configuration.
 */
Cube.init = function(width, height, index, name, target, config) {
    /* `super` the Base Class */
    Common.init.apply(this, arguments);

    /* Extend the config into a new object */
    this.config = $.extend({}, Config.cube, config);
    
    /* Get the `click.mp3` sound from the AssetManager */
    var soundUrl = 'assets/sound/click.mp3';
    soundUrl = Config.global.isCeltra ? Config.BASE_URL + soundUrl : soundUrl;
    this.sound = AssetManager.get(soundUrl);
    
    this.currentContent = 0;
    this.nextFaceIndex = 0;
    this.faces = [];
    this.faceData = [];

    /* If the cube is set to cast a shadow, create the shadow and init */
    this.shadow = Object.create(Shadow);
    this.shadow.init(this.width, this.height, this.index, this.name, this.target.parentNode, this);
    this.shadow.opacity = this.config.castShadow ? this.shadow.opacity : 0;
    this.shadow.render();
    
    /* Select the `light` from DOM */
    this.light = $('[role="light"]')[0];
    
    /* The light never moves so define the `lightTransform` on `init` */
    this.lightTransform = $.getTransform(this.light);

    /* Let's give ourselves access to the cube within closures where we dont control scope */
    var _self = this;

    /*
     *  renderFaces [private] - Render the faces of the Cube.
     *  @param {useReset} - Boolean determining whether we should reset the cube back to 0,0,0.
     */
    function renderFaces(useReset) {
        /* Reset variables and remove existing faces */
        _self.nextFaceIndex = 0;
        _self.faces.forEach(function(face) {
            face.remove();
        });

        var oldRot;

        if (useReset) {
            oldRot = $.clone(_self.rotation);
            _self.rotation = { X: 0, Y: 0, Z: 0 };
            _self.render();
        }

        /* Populate the Cube's `faces` array with Faces */
        _self.faces = [];
        for (var i = 0; i < 6; i++) {
            var face = Object.create(Face);
            face.init(_self.width, _self.height, i, _self.name, _self.element, _self);
            /* If cube is sequential, change the faces to reflect this */
            if (_self.config.isSequential) face.changeContent(_self.currentContent);
            face.rotation.Y = i === 1 ? 180 : i === 2 ? 90 : i === 3 ? -90 : 0;
            face.rotation.X = i === 4 ? 90 : i === 5 ? -90 : 0;
            face.render();
            _self.faces.push(face);
        }

        getFaceData();

        if (useReset && oldRot) {
            _self.rotation = oldRot;
            _self.render();
        }
    }

    function getFaceData() {
        /* Calculate the Vertex Data for the Faces for Dynamic Lighting */
        _self.faceData = _self.faces.map(function(face) {
            return $('.shadow', face.element)[0];
        }).map(function(elem) {
            var verticies = $.computeVertexData(elem);
            elem.style.opacity = 0;
            return {
                verticies: verticies,
                normal: Vect3.normalize(Vect3.cross(Vect3.sub(verticies.b, verticies.a), Vect3.sub(verticies.c, verticies.a))),
                center: Vect3.divs(Vect3.sub(verticies.c, verticies.a), 2),
                elem: elem
            };
        });
    }

    /* Call `renderFaces` on `init` */
    renderFaces();

    /* Translate the Cube on the z axis */
    this.target.style[$.CSS_TRANSFORM] = 'translateZ(-' + (this.width / 2) + 'px)';
    this.element.addEventListener('touchstart', touchStart);

    /* Double tap to fold out mechanic if the we are gamifying the experience */
    if (Config.global.useGamification) {
        this.element.addEventListener('doubletap', function(e) {
            var face = getFaceFromTarget(e.target);
            var fold = Object.create(Fold);
            fold.init(_self, face.index);
        });
    }

    /* Expose private functions as public on the Cube */
    this.getFaceFromTarget = getFaceFromTarget;
    this.getNormalisedFaceRotation = normaliseFaces;
    this.rerenderFaces = renderFaces.bind(this, true);
    this.resetNormalisedFaces = resetNormalisedFaces;
    this.getAxisDefinition = getAxis;
    this.changeCubeNameChangeInvisibleFacesAndRotate = changeCubeNameChangeInvisibleFacesAndRotate;

    /* Private variables */
    var startX, startY, startT,
        currentX, currentY,
        axisDef, axis,
        direction, dirX, dirY,
        rDirection, oRDirection,
        current, change,
        hasMoved, changedDirection,
        endTween, oTween, interactedSide,
        moveStartT, moveStartX, moveStartY, lastMoveT;

    var decouple;

    /* On document `touchstart` subscribe to an event fired when a `touchmove` moves over this cube */
    document.addEventListener('touchstart', addCubeChangeListener);

    /* On document `touchend` decouple the subscription */
    document.addEventListener('touchend', function() {
        if (decouple) decouple();
    });

    /*
     *  resetNormalisedFaces [private] - Reset all faces Z-rotation back to 0.
     */
    function resetNormalisedFaces() {
        _self.faces.forEach(function(face) {
            face.rotation.Z = 0;
            face.render();
        });
    }

    /*
     *  addCubeChangeListener [private] - Add a listener for when the cube has been touched
     *  after another cube was interacted with.
     */
    function addCubeChangeListener() {
        decouple = $.emitter.on(_self.id, function(e) {
            if (decouple) decouple = decouple();
            touchStart(e);
        });
    }

    /*
     *  touchStart [private] - Event handler for Cube `touchstart`.
     *  @param {e} - An Event object.
     */
    function touchStart(e) {

        /* Remove `touchstart` event handler */
        _self.element.removeEventListener('touchstart', touchStart);

        /* Set interaction variables */
        var touch = e.changedTouches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startT = Date.now();
        currentX = startX;
        currentY = startY;

        hasMoved = changedDirection = false;
        velocity = change = 0;

        /* If already tweening `pause` tween and store for later */
        if (endTween) {
            endTween.pause();
            oTween = endTween;
        } else {
            /* Traverse the DOM to get the interacted `Face` object from the event `target` */
            interactedSide = getFaceFromTarget(e.target);
            /* If Cube is sequential change all other `Face`s to the next Face in the sequence */
            if (_self.config.isSequential) {
                _self.currentContent++;
                _self.faces.filter(function(face) {
                    return face.index !== interactedSide.index;
                }).forEach(function(face) {
                    _self.currentContent = face.changeContent(_self.currentContent);
                });
            }
        }

        /* Clone and store the current Cube rotation */
        current = $.clone(_self.rotation);
        /* Get the axis definition from the Cubes current rotation */
        axisDef = getAxis(current);

        /* Add touch event handlers to the whole document */
        document.addEventListener('touchmove', touchMove);
        document.addEventListener('touchend', touchEnd);
    }

    /*
     *  touchMove [private] - Event handler for document `touchmove`.
     *  @param {e} - An Event object.
     */
    function touchMove(e) {

        /* If this Cube has subscribed to a `touchmove` over, decouple it */
        if (decouple) decouple = decouple();

        /* Prevent browsers default `touchmove` behaviour */
        e.preventDefault();

        /* Update interaction variables */
        var touch = e.changedTouches[0];
        dirX = touch.clientX < currentX ? 'left' : 'right';
        dirY = touch.clientY < currentY ? 'up' : 'down';

        currentX = touch.clientX;
        currentY = touch.clientY;

        /* Check if `touchmove` has left original Cube and entered another Cube */
        var elem = document.elementFromPoint(currentX, currentY);
        var side = getFaceElementFromTarget(elem);

        /* 
         * If `side` is defined and the ID's do not match, force `touchEnd` on
         * current element and publish an event for the new Cube.
         * 
         * If `side` is undefined, we have exited the Cube area, so if inertia
         * is turned off we should force a `touchEnd` on the current Cube.
         */
        if (side) {
            var id = side.getAttribute('parent');
            if (id !== _self.id) {
                var onAnimComplete = function() {
                    $.emitter.emit(id, $.extend({}, e, { target: elem }));
                };

                touchEnd($.extend({}, e, { onAnimComplete: onAnimComplete }));
                return;
            }
        } else if (!_self.config.useInertia) {
            touchEnd(e);
            return;
        }

        /* If the distance moved is less than one, cancel interaction */
        var dX = (startX - currentX) / (_self.width / 90);
        var dY = (startY - currentY) / (_self.height / 90);
        var adX = Math.abs(dX);
        var adY = Math.abs(dY);

        if (Math.max(adX, adY) < 1) return;

        /* If `axis` is undefined, define the `direction` and `axis` of our animation */
        if (!$.isDefined(axis)) {
            direction = adX > adY ? 'leftright' : 'updown';
            axis = direction === 'leftright' ? axisDef.LR : axisDef.UD;
            /* For normalization rotate the opposite side the current `interactedSide` based on `direction` */
            rotateOppositeFace(interactedSide, direction);
        }

        /* Check if we have changed direction on the same axis, if so update our `moveStart` variables */
        oRDirection = rDirection;
        rDirection = direction === 'leftright' ? dirX : dirY;

        if (oRDirection !== rDirection) {
            changedDirection = true;
            moveStartT = Date.now();
            moveStartX = currentX;
            moveStartY = currentY;
        }

        lastMoveT = Date.now();

        /* We are sure we have moved by this point */
        hasMoved = true;

        /* Calculate the `change` in rotation on the correct axis */
        change = direction === 'leftright' ? dX : dY;
        change = determineCalculation(change);

        /* Check if the `Interpol` render pipeline already has a render function for our Cube */
        if (!Interpol.pipeline.has('render' + _self.id)) {
            /* If not add the render function to the `Interpol` pipeline. */
            Interpol.pipeline.add('render' + _self.id, function render() {
                var oldRot = _self.rotation[axis];
                var newRot = Math.round(current[axis] + change);
                var nNearest = $.nearest(newRot, 90);
                var oNearest = $.nearest(oldRot, 90);
                /* 
                 * If the `nNearest` and `oNearest` do not match, we know the Cube
                 * has passed a 45degree rotation and therefore we should play the sound.
                 */
                if (nNearest !== oNearest && Config.global.useSound) _self.sound.play();
                _self.rotation[axis] = newRot;
                _self.render();


                if (!_self.config.castShadow) return;
                if (direction === 'leftright') {
                    _self.shadow.rotation.Z = determineCalculation(newRot);
                    _self.shadow.render();
                } else if (direction === 'updown') {
                    var rotVal = Math.abs(newRot - nNearest) / 45;
                    var scaleVal = 1 + ((rotVal * _self.shadow.hypRatio) / 2);
                    var currentRot = Math.abs(_self.shadow.rotation.Z);
                    _self.shadow.scale.X = (currentRot === 90 || currentRot === 270 ? scaleVal : 1);
                    _self.shadow.scale.Y = (currentRot === 0 || currentRot === 180 ? scaleVal : 1);
                    // _self.shadow.opacity = 0.1 * (scaleVal * 1.5);
                    _self.shadow.render();
                }
            });
        }
    }

    /*
     *  touchEnd [private] - Event handler for document `touchend`.
     *  @param {e} - An Event object.
     */
    function touchEnd(e) {

        /* Remove the touch event handlers from the document */
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);

        /* If the Cube is sequential or there has been no movement, immediately readd the event handler to the Cube */
        if (!_self.config.isSequential || !hasMoved) {
            _self.element.addEventListener('touchstart', touchStart);
            addCubeChangeListener();
        }

        /* If no movement exit out of this function early */
        if (!hasMoved) {
            /* If there is an old tween, continue it */
            if (oTween) {
                oTween.play();
                oTween = undefined;
            }
            return;
        }
        /* If the `Interpol` render pipeline has a render function for this Cube, remove it */
        if (Interpol.pipeline.has('render' + _self.id)) Interpol.pipeline.remove('render' + _self.id);

        /* Set final interaction variables */
        var touch = e.changedTouches[0];
        var moveEndT = Date.now();
        var moveEndX = touch.clientX;
        var moveEndY = touch.clientY;

        /* Work out the total distance moved and the time it took */
        var moveDistX = moveEndX - moveStartX;
        var moveDistY = moveEndY - moveStartY;
        var diffDistance = direction === 'leftright' ? moveDistX : moveDistY;
        var diffTime = moveEndT - moveStartT;

        var diffTimeSinceLastMove = moveEndT - lastMoveT;

        /* Transform the distance moved based on direction of movement */
        diffDistance = diffDistance < 0 && (rDirection === 'right' || rDirection === 'down') ? Math.abs(diffDistance) : diffDistance;
        diffDistance = diffDistance > 0 && (rDirection === 'left' || rDirection === 'up') ? -diffDistance : diffDistance;

        /* Velocity is distance over time */
        var velocity = diffDistance / diffTime;
        var velMin = Math.abs(diffDistance) < (_self.width * 0.8) / 2 ? 1 : 0;

        var startValue = current[axis];
        var currentValue = _self.rotation[axis];

        var val = $.nearest(currentValue, 90);
        var perc = 1;

        /* 
         * If using inertia determine the new value to animate to, otherwise determine
         * one rotation in the right direction from the `startValue`.
         */
        if (_self.config.useInertia && Math.abs(velocity) > 0.8) {
            var mathOp = velocity < 0 ? 'min' : 'max';
            var val1 = velocity < 0 ? -velMin : velMin;
            var val2 = Math.round(velocity * 2);

            val = val - determineCalculation(Math[mathOp](val1, val2) * 90);
            perc = Math.abs(val - currentValue) / 90;
        } else {
            var sV = $.nearest(startValue, 90);
            val = (rDirection === 'up' || rDirection === 'left') ? sV + determineCalculation(90) : sV - determineCalculation(90);
        }

        var from = currentValue;
        var to = val;

        var time = 'onAnimComplete' in e ? 100 : 300;

        /* Define the animation and start it immediately */
        var oldV, dispatchedAnimComplete = false;
        endTween = Interpol.tween()
            .from(from)
            .to(to)
            .duration(Math.round(time * perc))
            .ease(Interpol.easing.easeOutCirc)
            .step(function step(val) {
                oldV = oldV || val;
                var nNearest = $.nearest(val, 90);
                var oNearest = $.nearest(oldV, 90);
                /* 
                 * If the `nNearest` and `oNearest` do not match, we know the Cube
                 * has passed a 45degree rotation and therefore we should play the sound.
                 */
                if (nNearest !== oNearest && Config.global.useSound) _self.sound.play();
                _self.rotation[axis] = val;
                _self.render();
                oldV = val;

                if (_self.config.castShadow) {
                    if (direction === 'leftright') {
                        _self.shadow.rotation.Z = determineCalculation(val);
                        _self.shadow.render();
                    } else if (direction === 'updown') {
                        var rotVal = Math.abs(val - nNearest) / 45;
                        var scaleVal = 1 + ((rotVal * _self.shadow.hypRatio) / 2);
                        var currentRot = Math.abs(_self.shadow.rotation.Z);
                        _self.shadow.scale.X = (currentRot === 90 || currentRot === 270 ? scaleVal : 1);
                        _self.shadow.scale.Y = (currentRot === 0 || currentRot === 180 ? scaleVal : 1);
                        // _self.shadow.opacity = 0.1 * (scaleVal * 1.5);
                        _self.shadow.render();
                    }
                }
                
                /*
                 * Check if this touchEnd has been fired because we moved over a different
                 * cube. If we are less than 10 degrees away from our target rotation, begin
                 * interacting with the next cube.
                 */
                if ('onAnimComplete' in e) {
                    var diff = Math.abs(to - val);
                    if (diff <= 10 && !dispatchedAnimComplete) {
                        dispatchedAnimComplete = true;
                        e.onAnimComplete();
                    }
                }
            })
            .complete(function complete(val) {
                var endVal = $.norm($.nearest(val, 90) % 360);
                _self.rotation[axis] = endVal;
                _self.render();

                if (_self.config.castShadow) {
                    if (direction === 'leftright') {
                        _self.shadow.rotation.Z = determineCalculation(endVal);
                        _self.shadow.render();
                    } else if (direction === 'updown') {
                        _self.shadow.scale.X = _self.shadow.scale.Y = 1;
                        // _self.shadow.opacity = 0.1;
                        _self.shadow.render();
                    }
                }

                dispatchRotationComplete();
                if (_self.config.isSequential) {
                    _self.element.addEventListener('touchstart', touchStart);
                    addCubeChangeListener();
                }
                /* Reset variables */
                axis = undefined;
                rDirection = undefined;
                endTween = undefined;
                /* Normalise Face rotation based on new cube rotation */
                normaliseFaces(_self.rotation);
            })
            .start();
    }

    /*
     *  getFaceFromTarget [private] - Get `Face` object from `target`.
     *  @param {target} - An HTML Element.
     *
     *  @returns {Face OR undefined} - `Face` object or `undefined` if not found.
     */
    function getFaceFromTarget(target) {
        var elem = getFaceElementFromTarget(target);
        return $.isDefined(elem) ? _self.faces[parseInt(elem.getAttribute('index'), 10)] : undefined;
    }

    /*
     *  getFaceElementFromTarget [private] - Get a `Face` HTML Element from `target`.
     *  @param {target} - An HTML Element.
     *
     *  @returns {HTML Element OR undefined} - `Face` HTML Element or `undefined` if not found.
     */
    function getFaceElementFromTarget(target) {
        var el = target;
        while((el !== null) && !/side/.test(el.className)) {
            el = el.parentNode;
        }
        return el === null || !$.isDefined(el) ? undefined : el;
    }

    /*
     *  getAxis [private] - Get a axis definition from `rotation`.
     *  @param {rotation} - An Object containing rotation on the `X`, `Y` and `Z` axis.
     *
     *  @returns {object} - An Object containing the `Left/Right (LR)`, `Up/Down (UD)` and `Middle (Mid)` axis.
     */
    function getAxis(rotation) {
        var ncX = $.norm($.nearest(rotation.X, 90) % 360),
            ncY = $.norm($.nearest(rotation.Y, 90) % 360);

        var LR = ncX === 90 || ncX === 270 ? 'Z' : 'Y',
            UD = ncY === 90 || ncY === 270 ? 'Z' : 'X',
            Mid = ['X', 'Y', 'Z'].filter(function(val) {
                return val !== LR && val !== UD;
            })[0];

        return {
            LR: LR,
            UD: UD,
            Mid: Mid
        };
    }

    /*
     *  normaliseFaces [private] - Normalise `Face` rotation to always be upright, using the predefined Normalisation Matrix.
     *  @param {rotation} - An Object containing rotation on the `X`, `Y` and `Z` axis.
     *  @param {index} (Optional) - For forcing a specific definition from the Normalisation Matrix.
     */
    function normaliseFaces(rotation, index) {
        if (!_self.config.normaliseFacialRotation && typeof index === 'undefined') return;

        var nX = $.norm($.nearest(rotation.X, 90) % 360),
            nY = $.norm($.nearest(rotation.Y, 90) % 360),
            nZ = $.norm($.nearest(rotation.Z, 90) % 360);

        if (typeof index !== 'undefined' && index !== true) return matrix[index][nX][nY][nZ];

        for (var i = _self.faces.length - 1; i >= 0; i--) {
            var s = _self.faces[i];
            s.rotation.Z = matrix[i][nX][nY][nZ];
            s.render();
        }
    }

    /*
     *  rotateOppositeFace [private] - Normalise Opposite `Face` rotation to be correct according to the rotation direction.
     *  @param {face} - An `Face` Object of the current interacted side.
     *  @param {direction} - A string containing the direction of movement.
     */
    function rotateOppositeFace(face, direction) {
        if (!_self.config.normaliseFacialRotation || direction !== 'updown') return;

        var oIndex = $.isEven(face.index) ? face.index + 1 : face.index - 1;
        var oSide = _self.faces[oIndex];

        oSide.rotation.Z = oSide.renderedZ + 180;
        oSide.render();
    }

    /*
     *  determineCalculation [private] - Determine the correct value of `val` from the current rotation.
     *  @param {val} - The value to correct.
     *  
     *  @returns {number} - The corrected value.
     */
    function determineCalculation(val) {
        var rX = $.norm($.nearest(_self.rotation.X, 90) % 360),
            rY = $.norm($.nearest(_self.rotation.Y, 90) % 360);

        if (direction === 'leftright') {
            if (
                (rX === 180 && axis === 'Y') ||
                (rX === 90 && rY === 0) ||
                (rX === 270 && (axis !== 'Z' || rY === 180))
            ) {
                return val;
            } else {
                return -val;
            }
        } else {
            if (rY === 270) {
                return -val;
            } else {
                return val;
            }
        }
    }

    /*
     *  dispatchRotationComplete [private] - Publish a `rotation_complete` event if the Cube is `gamified`.
     */
    function dispatchRotationComplete() {
        if (Config.global.useGamification && _self.config.matchSides !== false) $.emitter.emit('rotation_complete');
    }

    /*
     *  changeCubeNameChangeInvisibleFacesAndRotate [private] - Change the cube name from outside of the Cube.
     *  @param {name} - The new name of the cube and subsequent sides.
     */
    function changeCubeNameChangeInvisibleFacesAndRotate(name) {
        var target = document.elementFromPoint($.windowWidth() / 2, $.windowHeight() / 2),
            visibleSide = getFaceFromTarget(target);

        _self.name = name;

        _self.faces.map(function(face) {
            face.name = name;
            return face;
        }).filter(function(face) {
            return face.index !== visibleSide.index;
        }).forEach(function(face) {
            _self.currentContent = face.changeContent(0);
        });

        normaliseFaces(_self.rotation);

        var axisDef = getAxis(_self.rotation),
            axis = $.range(0, 100) < 50 ? axisDef.UD : axisDef.LR,
            amount = $.range(0, 100) < 50 ? 90 : -90,
            startValue;

        Interpol.tween()
            .from(0)
            .to(amount)
            .ease(Interpol.easing.easeOutCirc)
            .step(function(val) {
                _self.rotation[axis] = startValue + val;
                _self.render();
            })
            .complete(function() {
                _self.faces.forEach(function(face, i) {
                    face.changeContent(i);
                });

                _self.rotation.X = _self.rotation.Y = _self.rotation.Z = 0;
                _self.render();

                getFaceData();

                normaliseFaces(_self.rotation);
            })
            .start(function() {
                startValue = _self.rotation[axis];
            });
    }



};

/*
 *  Cube.render - Override `render` on the Base Class.
 */
Cube.render = function() {
    /* `super` the Base Class */
    Common.render.call(this);

    /* If no dynamic lighting, remove all shadows and exit this function */
    if (!Config.global.useDynamicLighting) {
        this.faceData.forEach(function(face) {
            face.elem.style.opacity = 0;
        });
        return;
    }

    /* Dynamic Lighting */
    var face, direction, amount,
        faceNum = 0, faceCount = this.faceData.length,
        cubeTransform = $.getTransform(this.element),
        lightPosition = Vect3.rotate(this.lightTransform.translate, Vect3.muls(cubeTransform.rotate, -1));

    while (++faceNum < faceCount) {
        face = this.faceData[this.nextFaceIndex];
        direction = Vect3.normalize(Vect3.sub(lightPosition, face.center));
        amount = 1 - Math.max(0, Vect3.dot(face.normal, direction)).toFixed(3);
        if (face.light != amount) {
            face.light = amount;
            face.elem.style.opacity = amount;
        }
        this.nextFaceIndex = (this.nextFaceIndex + 1) % faceCount;
    }
};

module.exports = Cube;
},{"../assetmanager":41,"../config":46,"../utilities":58,"./common":47,"./face":49,"./fold":50,"./matrix":52,"./shadow":53,"./vect3":54,"interpol":2}],52:[function(require,module,exports){
module.exports={
    "0" : {
        "0" : {
            "0" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "90" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "180" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "270" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            }
        },
        "90" : {
            "0" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "90" : {
                "0" : 270,
                "90" : 180,
                "180" : 90,
                "270" : 0
            },
            "180" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "270" : {
                "0" : 90,
                "90" : 0,
                "180" : 270,
                "270" : 180
            }
        },
        "180" : {
            "0" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "90" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "180" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "270" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            }
        },
        "270" : {
            "0" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "90" : {
                "0" : 90,
                "90" : 0,
                "180" : 270,
                "270" : 180
            },
            "180" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "270" : {
                "0" : 270,
                "90" : 180,
                "180" : 90,
                "270" : 0
            }
        }
    },
    "1" : {
        "0" : {
            "0" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "90" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "180" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "270" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            }
        },
        "90" : {
            "0" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "90" : {
                "0" : 90,
                "90" : 180,
                "180" : 270,
                "270" : 0
            },
            "180" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "270" : {
                "0" : 270,
                "90" : 0,
                "180" : 90,
                "270" : 180
            }
        },
        "180" : {
            "0" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "90" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "180" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "270" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            }
        },
        "270" : {
            "0" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "90" : {
                "0" : 270,
                "90" : 0,
                "180" : 90,
                "270" : 180
            },
            "180" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "270" : {
                "0" : 90,
                "90" : 180,
                "180" : 270,
                "270" : 0
            }
        }
    },
    "2" : {
        "0" : {
            "0" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "90" : {
                "0" : 0,
                "90" : 180,
                "180" : 180,
                "270" : 180
            },
            "180" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "270" : {
                "0" : 0,
                "90" : 0,
                "180" : 180,
                "270" : 0
            }
        },
        "90" : {
            "0" : {
                "0" : 270,
                "90" : 270,
                "180" : 270,
                "270" : 270
            },
            "90" : {
                "0" : 180,
                "90" : 180,
                "180" : 180,
                "270" : 0
            },
            "180" : {
                "0" : 90,
                "90" : 90,
                "180" : 90,
                "270" : 90
            },
            "270" : {
                "0" : 0,
                "90" : 0,
                "180" : 0,
                "270" : 180
            }
        },
        "180" : {
            "0" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "90" : {
                "0" : 180,
                "90" : 180,
                "180" : 0,
                "270" : 180
            },
            "180" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "270" : {
                "0" : 180,
                "90" : 0,
                "180" : 0,
                "270" : 0
            }
        },
        "270" : {
            "0" : {
                "0" : 90,
                "90" : 90,
                "180" : 90,
                "270" : 90
            },
            "90" : {
                "0" : 180,
                "90" : 0,
                "180" : 180,
                "270" : 180
            },
            "180" : {
                "0" : 270,
                "90" : 270,
                "180" : 270,
                "270" : 270
            },
            "270" : {
                "0" : 0,
                "90" : 180,
                "180" : 0,
                "270" : 0
            }
        }
    },
    "3" : {
        "0" : {
            "0" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "90" : {
                "0" : 0,
                "90" : 0,
                "180" : 180,
                "270" : 0
            },
            "180" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "270" : {
                "0" : 0,
                "90" : 180,
                "180" : 180,
                "270" : 180
            }
        },
        "90" : {
            "0" : {
                "0" : 90,
                "90" : 90,
                "180" : 90,
                "270" : 90
            },
            "90" : {
                "0" : 0,
                "90" : 180,
                "180" : 0,
                "270" : 0
            },
            "180" : {
                "0" : 270,
                "90" : 270,
                "180" : 270,
                "270" : 270
            },
            "270" : {
                "0" : 180,
                "90" : 0,
                "180" : 180,
                "270" : 180
            }
        },
        "180" : {
            "0" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "90" : {
                "0" : 180,
                "90" : 0,
                "180" : 0,
                "270" : 0
            },
            "180" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "270" : {
                "0" : 180,
                "90" : 180,
                "180" : 0,
                "270" : 180
            }
        },
        "270" : {
            "0" : {
                "0" : 270,
                "90" : 270,
                "180" : 270,
                "270" : 270
            },
            "90" : {
                "0" : 0,
                "90" : 0,
                "180" : 0,
                "270" : 180
            },
            "180" : {
                "0" : 90,
                "90" : 90,
                "180" : 90,
                "270" : 90
            },
            "270" : {
                "0" : 180,
                "90" : 180,
                "180" : 180,
                "270" : 0
            }
        }
    },
    "4" : {
        "0" : {
            "0" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "90" : {
                "0" : 90,
                "90" : 270,
                "180" : 90,
                "270" : 90
            },
            "180" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "270" : {
                "0" : 270,
                "90" : 270,
                "180" : 270,
                "270" : 90
            }
        },
        "90" : {
            "0" : {
                "0" : 180,
                "90" : 180,
                "180" : 180,
                "270" : 180
            },
            "90" : {
                "0" : 270,
                "90" : 90,
                "180" : 90,
                "270" : 90
            },
            "180" : {
                "0" : 0,
                "90" : 0,
                "180" : 0,
                "270" : 0
            },
            "270" : {
                "0" : 90,
                "90" : 270,
                "180" : 270,
                "270" : 270
            }
        },
        "180" : {
            "0" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "90" : {
                "0" : 90,
                "90" : 90,
                "180" : 90,
                "270" : 270
            },
            "180" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "270" : {
                "0" : 270,
                "90" : 90,
                "180" : 270,
                "270" : 270
            }
        },
        "270" : {
            "0" : {
                "0" : 0,
                "90" : 0,
                "180" : 0,
                "270" : 0
            },
            "90" : {
                "0" : 90,
                "90" : 90,
                "180" : 270,
                "270" : 90
            },
            "180" : {
                "0" : 180,
                "90" : 180,
                "180" : 180,
                "270" : 180
            },
            "270" : {
                "0" : 270,
                "90" : 270,
                "180" : 90,
                "270" : 270
            }
        }
    },
    "5" : {
        "0" : {
            "0" : {
                "0" : 0,
                "90" : 270,
                "180" : 180,
                "270" : 90
            },
            "90" : {
                "0" : 270,
                "90" : 270,
                "180" : 270,
                "270" : 90
            },
            "180" : {
                "0" : 180,
                "90" : 270,
                "180" : 0,
                "270" : 90
            },
            "270" : {
                "0" : 90,
                "90" : 270,
                "180" : 90,
                "270" : 90
            }
        },
        "90" : {
            "0" : {
                "0" : 0,
                "90" : 0,
                "180" : 0,
                "270" : 0
            },
            "90" : {
                "0" : 270,
                "90" : 270,
                "180" : 90,
                "270" : 270
            },
            "180" : {
                "0" : 180,
                "90" : 180,
                "180" : 180,
                "270" : 180
            },
            "270" : {
                "0" : 90,
                "90" : 90,
                "180" : 270,
                "270" : 90
            }
        },
        "180" : {
            "0" : {
                "0" : 0,
                "90" : 90,
                "180" : 180,
                "270" : 270
            },
            "90" : {
                "0" : 270,
                "90" : 90,
                "180" : 270,
                "270" : 270
            },
            "180" : {
                "0" : 180,
                "90" : 90,
                "180" : 0,
                "270" : 270
            },
            "270" : {
                "0" : 90,
                "90" : 90,
                "180" : 90,
                "270" : 270
            }
        },
        "270" : {
            "0" : {
                "0" : 180,
                "90" : 180,
                "180" : 180,
                "270" : 180
            },
            "90" : {
                "0" : 90,
                "90" : 270,
                "180" : 270,
                "270" : 270
            },
            "180" : {
                "0" : 0,
                "90" : 0,
                "180" : 0,
                "270" : 0
            },
            "270" : {
                "0" : 270,
                "90" : 90,
                "180" : 90,
                "270" : 90
            }
        }
    }
}
},{}],53:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Shadow Class
 * @author: Joe Harlow
 *
 */

/* General Utilities */
var $ = require('../utilities');

/* Import modules */
var Common = require('./common');
var Config = require('../config');

/* Inherit from the Cube Component Base Class */
var Shadow = Object.create(Common);

/*
 *  Shadow.init - Override `init` on the Base Class.
 *  @param {width} - A number for the width of the component.
 *  @param {height} - A number for the height of the component.
 *  @param {index} - A number for the index of the component.
 *  @param {name} - A string to of the name of the component.
 *  @param {target} - An HTML Element where the component will be appended.
 *  @param {parent} - The Shadow's parent `Cube`.
 */
Shadow.init = function(width, height, index, name, target, parent) {
    this.parent = parent;
    this.scale = { X : 1, Y : 1 };
    this.opacity = 0.1;

    /* `super` the Base Class */
    Common.init.apply(this, arguments);

    this.rotation.X = 90;
    this.translate.Z = -(this.height * 0.8);

    this.hypotenuse = Math.sqrt((this.width * this.width) + (this.height * this.height));
    this.hypRatio = (this.hypotenuse / this.width) - 1;
};

/*
 *  Shadow.getElement - Override `getElement` on the Base Class.
 *
 *  @return {HTMLElement} - A HTML Element.
 */
Shadow.getElement = function() {
	var ratio = 1.5;
	var borderRadius = '25px';

    return $.getElement('div', 'cube-shadow', {}, {
		width : this.width / ratio + 'px',
		height : this.height / ratio + 'px',
		borderRadius : borderRadius
	});
};

/*
 *  Shadow.render - Override `render` on the Base Class.
 */
Shadow.render = function() {
    /* `super` the Base Class */
    Common.render.apply(this);

    /* Append scale to the end of the transform string */
    this.element.style[$.CSS_TRANSFORM] += ' scale(' + this.scale.X + ',' + this.scale.Y + ')';
    this.element.style.opacity = this.opacity;
};

module.exports = Shadow;
},{"../config":46,"../utilities":58,"./common":47}],54:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Vector3 Mathematics
 * @author: Keith Clark
 *
 */

var Vect3 = {
    create: function(x, y, z) {
        return {x: x || 0, y: y || 0, z: z || 0};
    },
    add: function(v1, v2) {
        return {x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z};
    },
    sub: function(v1, v2) {
        return {x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z};
    },
    mul: function(v1, v2) {
        return {x: v1.x * v2.x, y: v1.y * v2.y, z: v1.z * v2.z};
    },
    div: function(v1, v2) {
        return {x: v1.x / v2.x, y: v1.y / v2.y, z: v1.z / v2.z};
    },
    muls: function(v, s) {
        return {x: v.x * s, y: v.y * s, z: v.z * s};
    },
    divs: function(v, s) {
        return {x: v.x / s, y: v.y / s, z: v.z / s};
    },
    len: function(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    },
    dot: function(v1, v2) {
        return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
    },
    cross: function(v1, v2) {
        return {x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x};
    },
    normalize: function(v) {
        return Vect3.divs(v, Vect3.len(v));
    },
    ang: function(v1, v2) {
        return Math.acos(Vect3.dot(v1, v2) / (Vect3.len(v1) * Vect3.len(v2)));
    },
    copy: function(v) {
        return {x: v.x, y: v.y, z: v.z};
    },
    equal: function(v1,v2) {
        return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
    },
    rotate: function(v1, v2) {
        var x1 = v1.x,
            y1 = v1.y,
            z1 = v1.z,
            angleX = v2.x / 2,
            angleY = v2.y / 2,
            angleZ = v2.z / 2,

            cr = Math.cos(angleX),
            cp = Math.cos(angleY),
            cy = Math.cos(angleZ),
            sr = Math.sin(angleX),
            sp = Math.sin(angleY),
            sy = Math.sin(angleZ),

            w = cr * cp * cy + -sr * sp * sy,
            x = sr * cp * cy - -cr * sp * sy,
            y = cr * sp * cy + sr * cp * -sy,
            z = cr * cp * sy - -sr * sp * cy,

            m0 = 1 - 2 * ( y * y + z * z ),
            m1 = 2 * (x * y + z * w),
            m2 = 2 * (x * z - y * w),

            m4 = 2 * ( x * y - z * w ),
            m5 = 1 - 2 * ( x * x + z * z ),
            m6 = 2 * (z * y + x * w ),

            m8 = 2 * ( x * z + y * w ),
            m9 = 2 * ( y * z - x * w ),
            m10 = 1 - 2 * ( x * x + y * y );

        return {
            x: x1 * m0 + y1 * m4 + z1 * m8,
            y: x1 * m1 + y1 * m5 + z1 * m9,
            z: x1 * m2 + y1 * m6 + z1 * m10
        };
    }
};

module.exports = Vect3;
},{}],55:[function(require,module,exports){
var $ = require('../utilities');
var Config = require('../config');
var Stats = require('stats');
var Interpol = require('interpol');

var cubeUl;

function init() {

    addMetrics();

    var target = $('[role="debug"]')[0];

    var closeBtn = document.createElement('div');
    closeBtn.className = 'close';
    closeBtn.addEventListener('tap', function() {
        target.classList.add('hidden');
        document.addEventListener('touchmove', $.prevent);
        $.emitter.emit('debug_panel', false);
    });

    var openBtn = document.createElement('div');
    openBtn.className = 'open';
    openBtn.innerHTML = '<span></span>';
    openBtn.addEventListener('tap', function() {
        target.classList.remove('hidden');
        document.removeEventListener('touchmove', $.prevent);
        $.emitter.emit('debug_panel', true);
    });

    var main = document.createElement('div');
    main.className = 'main';

    target.appendChild(closeBtn);
    target.appendChild(openBtn);
    target.appendChild(main);

    var cTitle = document.createElement('h1');
    cTitle.innerText = 'Cube Properties';

    main.appendChild(cTitle);

    cubeUl = document.createElement('ul');

    main.appendChild(cubeUl);


    var gTitle = document.createElement('h1');
    gTitle.innerText = 'Global Properties';

    main.appendChild(gTitle);

    var ul = document.createElement('ul');
    
    Object.keys(Config.global).forEach(function(key) {
        var li = document.createElement('li');
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = key;

        if (Config.global[key]) input.setAttribute('checked', true);

        input.addEventListener('change', function(e) {
            Config.global[key] = e.target.checked;
        });

        var label = document.createElement('label');
        label.setAttribute('for', key);
        label.innerHTML = '<h1>' + Config.titles[key] + '</h1><p>' + Config.descriptions[key] + '</p>';

        li.appendChild(input);
        li.appendChild(label);

        ul.appendChild(li);
    });

    main.appendChild(ul);

    $.emitter.on('global_config_change', function(key, value) {
        var input = $('input#' + key, main)[0];
        if (value) {
            input.checked = true;
        } else {
            input.checked = false;
        }
    });
}

function addMetrics() {
    var target = $('[role="metrics"]')[0];

    var fps = new Stats();
    fps.domElement.style.position = 'absolute';
    fps.domElement.style.right = '0px';
    fps.domElement.style.bottom = '0px';

    var ms = new Stats();
    ms.setMode(1);
    ms.domElement.style.position = 'absolute';
    ms.domElement.style.right = '80px';
    ms.domElement.style.bottom = '0px';

    target.appendChild(fps.domElement);
    target.appendChild(ms.domElement);

    function update() {
        fps.update();
        ms.update();
    }

    fps.domElement.style.display = Config.global.displayMetrics ? 'block' : 'none';
    ms.domElement.style.display = Config.global.displayMetrics ? 'block' : 'none';
    if (Config.global.displayMetrics) Interpol.pipeline.add('stats', update);

    $.emitter.on('global_config_change', function(key, value) {
        if (key === 'displayMetrics') {
            fps.domElement.style.display = value ? 'block' : 'none';
            ms.domElement.style.display = value ? 'block' : 'none';
            Interpol.pipeline[value ? 'add' : 'remove']('stats', update);
        }
    });
}

function defineCubeProperties(cubes) {

    if (!cubeUl) return;

    cubeUl.innerHTML = '';

    var configs = cubes.map(function(cube) {
        return cube.config;
    });

    Object.keys(configs[0]).forEach(function(key) {
        var li = document.createElement('li');
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = key;

        if (configs[0][key]) input.setAttribute('checked', true);

        input.addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            
            configs.forEach(function(config) {
                if ((key === 'useVideo' || key === 'useGif') && isChecked)  {
                    config['useContent'] = true;
                    $('input#useContent', cubeUl)[0].checked = true;
                }

                if (key === 'useContent' && !isChecked) {
                    config['useVideo'] = config['useGif'] = false;
                    $('input#useVideo', cubeUl)[0].checked = false;
                    $('input#useGif', cubeUl)[0].checked = false;
                }

                if (key === 'isSequential' && isChecked) {
                    config['useInertia'] = false;
                    $('input#useInertia', cubeUl)[0].checked = false;
                }

                config[key] = isChecked;
            });

            switch (key) {
                case 'normaliseFacialRotation':
                case 'useBackgrounds':
                case 'useContent':
                case 'useVideo':
                case 'useGif':
                case 'isSequential':
                    cubes.forEach(function(cube) {
                        cube.rerenderFaces();
                        cube.getNormalisedFaceRotation(cube.rotation, true);
                    });

                    if (key === 'normaliseFacialRotation' && !isChecked) {
                        cubes.forEach(function(cube) {
                            cube.resetNormalisedFaces();
                        });
                    }
                    break;
            }
        });

        var label = document.createElement('label');
        label.setAttribute('for', key);
        label.innerHTML = '<h1>' + Config.titles[key] + '</h1><p>' + Config.descriptions[key] + '</p>';

        li.appendChild(input);
        li.appendChild(label);

        cubeUl.appendChild(li);
    });

}

module.exports = {
    init: init,
    defineCubeProperties: defineCubeProperties
};
},{"../config":46,"../utilities":58,"interpol":2,"stats":3}],56:[function(require,module,exports){
var parentWindow,
    parentOrigin;

window.addEventListener('message', function(e) {
    console.log(e);
    if (!/\.celtra/.test(e.origin)) return;
    if (!parentWindow || !parentOrigin) {
        parentWindow = e.source;
        parentOrigin = e.origin;
    }
    switch (e.data) {
        case 'init':
            parentWindow.postMessage('received_init', parentOrigin);
            break;
    }
});

var Messaging = {
    post: function(data) {
        if (parentWindow && parentOrigin) {
            parentWindow.postMessage(data, parentOrigin);
        }
    }
};

module.exports = Messaging;
},{}],57:[function(require,module,exports){
var $ = require('../utilities');
var Interpol = require('interpol');
var initialValues = { gamma: 0, beta: 0 };
var cachedValues = { gamma: 0, beta: 0 };
var prevValues = { gamma: 0, beta: 0 };

var elem;

function handler(e) {
    console.log('handler');

    prevValues.gamma = cachedValues.gamma;
    prevValues.beta = cachedValues.beta;

    cachedValues.gamma = initialValues.gamma - e.gamma;
    cachedValues.beta = initialValues.beta - e.beta;
}

function render() {

    var dt = 1 / 60;
    var RC = 0.3;
    var alpha = dt / (RC + dt);

    var rX = (alpha * cachedValues.beta) + (1 - alpha) * prevValues.beta;
    var rY = (alpha * cachedValues.gamma) + (1 - alpha) * prevValues.gamma;

    rX *= 0.5;
    rY *= 0.5;

    elem.style[$.CSS_TRANSFORM] = 'rotateX(' + rX.toFixed(3) + 'deg) rotateY(' + rY.toFixed(3) + 'deg)';
}

function getInitialValues(callback) {
    window.addEventListener('deviceorientation', function init(e) {
        initialValues.gamma = e.gamma;
        initialValues.beta = e.beta;
        window.removeEventListener('deviceorientation', init);
        if (callback) callback();
    });
}

function Orient(el) {
    console.log('orient');
    elem = el;
    getInitialValues();
    return Orient;
}

Orient.listen = function() {
    console.log('orient listen');
    window.addEventListener('deviceorientation', handler);
    Interpol.pipeline.add('orient', render);
    return Orient;
};

Orient.detach = function() {
    window.removeEventListener('deviceorientation', handler);
    Interpol.pipeline.remove('orient');
    return Orient;
};

Orient.reset = function(fn) {
    getInitialValues(fn);
    return Orient;
};


module.exports = Orient;
},{"../utilities":58,"interpol":2}],58:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Utilities
 * @author: Joe Harlow
 *
 */

var w = window,
	d = document;

/*
 *  _getFirstSupported [private] - Take an array of CSS properties and return a supported string.
 *  @param {arr} - An array of properties to check against.
 *
 *  @return {string} - A vendor specific CSS property string.
 */
function _getFirstSupported(arr) {
    var div = document.createElement('div');
    var ven = null;
    arr.forEach(function(vendor) {
         if (typeof div.style[vendor] !== 'undefined') ven = vendor;
    });

    return ven;
}

/*
 *  prefixProperty [private] - Calculates the vendor specific string for the supplied CSS property.
 *  @param {prop} - The property string
 *
 *  @return {string} - The vendor specific string.
 */
function prefixProperty(prop) {
    var propCap = prop.charAt(0).toUpperCase() + prop.substring(1);
    var arr = ' ms Moz Webkit O'.split(' ').map(function(prefix) {
        return prefix === '' ? prop : prefix + propCap;
    });
    return _getFirstSupported(arr);
}

/*
 *  selector - A simple DOM Element selection function.
 *  @param {sel} - A string CSS selector to query for.
 *  @param {context} (Optional) - A HTML Element context to check within, defaults to document.
 *
 *  @return {array} - An array of matched elements.
 */
function selector(sel, context) {
	return Array.prototype.slice.call((context || d).querySelectorAll(sel));
}

/*
 *  selector.ready - A simple DOM Ready handler.
 *  @param {fn} - A function to be called when the DOM is ready.
 */
selector.ready = function(fn) {
	if (d.readyState === 'complete') return setTimeout(fn, 1);
	w.addEventListener('DOMContentLoaded', fn);
};

/*
 *  selector.extend - Extend objects into each other.
 *  @param {object} - An initial object to extend into.
 *  @params {...arguments} - Objects to extend into the initial object.
 *
 *  @return {object} - The extended object.
 */
selector.extend = function() {
    var args = [].slice.call(arguments),
        ret = args[0];
    for (var i = 1, len = args.length; i < len; i++) {
        var obj = args[i];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) ret[prop] = obj[prop];
        }
    }
    return ret;
};

/*
 *  selector.clone - Clone an object.
 *  @param {obj} - The object to clone.
 *
 *  @return {object} - The cloned object.
 */
selector.clone = function(obj) {
    return selector.extend({}, obj);
};

/*
 *  selector.norm - Normalise rotation.
 *  @param {deg} - The number of degrees to normalise.
 *
 *  @return {number} - The normalised number of degrees.
 */
selector.norm = function(deg) {
    if (deg >= 0) return deg;
    return 360 - Math.abs(deg);
};

/*
 *  selector.deg2rad - Convert degrees to radians.
 *  @param {deg} - The number of degrees to convert.
 *
 *  @return {number} - The number of degrees in radians.
 */
selector.deg2rad = function(deg) {
    return deg * 0.017453292519943295; // (deg / 180) * Math.PI
};

/*
 *  selector.rad2deg - Convert radians to degrees.
 *  @param {rad} - The number of radians to convert.
 *
 *  @return {number} - The number of radians in degrees.
 */
selector.rad2deg = function(rad) {
    return rad * 57.29577951308232; // rad / Math.PI * 180
};

/*
 *  selector.prevent - A simple preventDefault event handler.
 *  @param {e} - The event to be prevented.
 */
selector.prevent = function(e) {
    e.preventDefault();
};

/*
 *  selector.format - A simple string formatter.
 *  @param {str} - The string to format.
 *  @param {obj} - The dictionary to use for string formatting.
 *
 *  @return {string} - The formatted string.
 */
selector.format = function(str, obj) {
    return str.toString().replace(/\{([^}]+)\}/g, function(match, group) {
        return obj[group];
    });
};

/*
 *  selector.range - A random integer generator between `min` and `max`.
 *  @param {min} - The minimum integer.
 *  @param {max} - The maximum integer.
 *
 *  @return {integer} - A random integer in the designated range.
 */
selector.range = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*
 *  selector.floatRange - A random float generator between `min` and `max`.
 *  @param {min} - The minimum float.
 *  @param {max} - The maximum float.
 *
 *  @return {float} - A random float in the designated range.
 */
selector.floatRange = function(min, max) {
    return Math.random() * (max - min) + min;
};

/*
 *  selector.nearest - Round the supplied `val` to the nearest `factor`.
 *  @param {val} - The value to be rounded.
 *  @param {factor} - The factor to be rounded to.
 *
 *  @return {number} - The rounded number.
 */
selector.nearest = function(val, factor) {
	return Math.round(val / factor) * factor;
};

/*
 *  selector.isEven - Check whether the supplied number is even.
 *  @param {num} - The value to be checked.
 *
 *  @return {boolean} - Whether the value is even or not.
 */
selector.isEven = function(num) {
    return num % 2 === 0;
};

/*
 *  selector.isOdd - Check whether the supplied number is odd.
 *  @param {num} - The value to be checked.
 *
 *  @return {boolean} - Whether the value is odd or not.
 */
selector.isOdd = function(num) {
    return num % 2 !== 0;
};

/*
 *  selector.isDefined - Check whether the supplied value is defined.
 *  @param {*} - The value to be checked.
 *
 *  @return {boolean} - Whether the value is defined or not.
 */
selector.isDefined = function(val) {
    return val !== void 0;
};

/*
 *  selector.getElement - Return a new HTML element with the defined parameters.
 *  @param {tag} - A string of the HTML tag name to be created.
 *  @param {className} - A string of the className for the element.
 *  @param {attrs} - A hash map of attributes to be applied to the element.
 *  @param {style} - A hash map of styles to be applied to the element.
 *
 *  @return {HTMLElement} - The created HTMLElement.
 */
selector.getElement = function(tag, className, attrs, style) {
    var el = d.createElement(tag);
    el.className = className;
    Object.keys(attrs).forEach(function(key) {
        el.setAttribute(key, attrs[key]);
    });
    Object.keys(style).forEach(function(key) {
        el.style[key] = style[key];
    });
    return el;
};

/*
 *  selector.getRandomRotation - Return a random rotation from the supplied `opts` or defaults.
 *  @param {opts} (Optional) - An array of options to pic from.
 *
 *  @return {HTMLElement} - A random rotation from the `opts` or defaults.
 */
selector.getRandomRotation = function(opts) {
    opts = opts || [0, 90, 180, 270];
    return opts[selector.range(0, opts.length - 1)];
};

/*
 *  selector.emitter - An IIFE for a small PubSub/EventEmitter lib.
 *
 *  @return {object} - The event emitter lib.
 */
selector.emitter = (function() {
    var _listeners = {};

    /*
     *  emitter.on - Subscribe to an event with the designated callback and function scope.
     *  @param {ev} - The event name to subscribe to.
     *  @param {fn} - The callback function to use.
     *  @param {scope} (Optional) - The scope to bind to the callback function.
     *
     *  @return {function} - A decoupling event to unbind the event subscription.
     */
    function on() {
        var args = [].slice.call(arguments);
        var ev = args[0],
            fn = args[1],
            scope = args[2] || selector;
     
        _listeners[ev] = _listeners[ev] || [];
        _listeners[ev].push({ fn : fn, scope : scope });

        var idx = _listeners[ev].length - 1;
        return function decouple() {
            _listeners[ev].splice(idx, 1);
        };
    }

    /*
     *  emitter.emit - Publish an event to the designated event name
     *  @param {ev} - The event name to publish.
     *  @param {...arguments} (Optional) - The paramters to be passed into the events subscribed callbacks.
     */
    function emit() {
        var args = [].slice.call(arguments);
        var ev = args[0],
            props = args.slice(1);
     
        if (!(ev in _listeners)) return;

        _listeners[ev].forEach(function(listener) {
            listener.fn.apply(listener.scope, props);
        });
    }
     
    return {
        on: on,
        emit: emit
    };
})();

/*
 *  selector.windowWidth - An IIFE for a small cross-browser window width implementation.
 *
 *  @return {function} - When called will report the width of the window.
 */
selector.windowWidth = (function() {
    if (typeof w.innerWidth !== 'undefined') {
        return function() {
            return w.innerWidth;
        };
    } else {
        var b = ('clientWidth' in d.documentElement) ? d.documentElement : d.body;
        return function() {
            return b.clientWidth;
        };
    }
})();

/*
 *  selector.windowHeight - An IIFE for a small cross-browser window height implementation.
 *
 *  @return {function} - When called will report the height of the window.
 */
selector.windowHeight = (function() {
    if (typeof w.innerHeight !== 'undefined') {
        return function() {
            return w.innerHeight;
        };
    } else {
        var b = ('clientHeight' in d.documentElement) ? d.documentElement : d.body;
        return function() {
            return b.clientHeight;
        };
    }
})();

/*
 *  selector.CSS_TRANSFORM - The vendor specific string for CSS transforms.
 */
selector.CSS_TRANSFORM = prefixProperty('transform');

/*
 *  selector.CSS_TRANSFORM_ORIGIN - The vendor specific string for CSS transform origin.
 */
selector.CSS_TRANSFORM_ORIGIN = prefixProperty('transformOrigin');

/*
 *  selector.CSS_PERSPECTIVE - The vendor specific string for CSS perspective.
 */
selector.CSS_PERSPECTIVE = prefixProperty('perspective');

/*
 *  selector.computeVertexData - Take an element and return the A, B, C and D vertices.
 *  @param {elem} - An HTML element to have its vertices calculated.
 *
 *  @return {object} - An object of vertex data for the supplied element.
 */
selector.computeVertexData = function(elem) {
    var w = elem.offsetWidth,
        h = elem.offsetHeight,
        v = {
            a: { x: -w / 2, y: -h / 2, z: 0 },
            b: { x:  w / 2, y: -h / 2, z: 0 },
            c: { x:  w / 2, y:  h / 2, z: 0 },
            d: { x: -w / 2, y:  h / 2, z: 0 }
        },
        transform;

    while (elem.nodeType === 1) {
        transform = selector.getTransform(elem);
        v.a = addVectors(rotateVector(v.a, transform.rotate), transform.translate);
        v.b = addVectors(rotateVector(v.b, transform.rotate), transform.translate);
        v.c = addVectors(rotateVector(v.c, transform.rotate), transform.translate);
        v.d = addVectors(rotateVector(v.d, transform.rotate), transform.translate);
        elem = elem.parentNode;
    }
    return v;
};

/*
 *  selector.getTransform - Take an element and return the transformation data.
 *  @param {elem} - An HTML element to have its transformation calculated.
 *
 *  @return {object} - An object of transformation data for the supplied element.
 */
selector.getTransform = function(elem) {
    var val = getComputedStyle(elem, null)[selector.CSS_TRANSFORM],
        matrix = parseMatrix(val),
        rotateY = Math.asin(-matrix.m13),
        rotateX, rotateZ;

        rotateX = Math.atan2(matrix.m23, matrix.m33);
        rotateZ = Math.atan2(matrix.m12, matrix.m11);

    return {
        transformStyle: val,
        matrix: matrix,
        rotate: {
            x: rotateX,
            y: rotateY,
            z: rotateZ
        },
        translate: {
            x: matrix.m41,
            y: matrix.m42,
            z: matrix.m43
        }
    };
};


/*
 *  parseMatrix [private] - Take an string and return a 4x4 Matrix definition.
 *  @param {string} - The string to be parsed.
 *
 *  @return {object} - A 4x4 Matrix definition.
 */
function parseMatrix (matrixString) {
    var c = matrixString.split(/\s*[(),]\s*/).slice(1,-1),
        matrix;

    if (c.length === 6) {
        // 'matrix()' (3x2)
        matrix = {
            m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
            m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
            m13: 0,     m23: 0,     m33: 1, m43: 0,
            m14: 0,     m24: 0,     m34: 0, m44: 1
        };
    } else if (c.length === 16) {
        // matrix3d() (4x4)
        matrix = {
            m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
            m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
            m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
            m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
        };

    } else {
        // handle 'none' or invalid values.
        matrix = {
            m11: 1, m21: 0, m31: 0, m41: 0,
            m12: 0, m22: 1, m32: 0, m42: 0,
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    }
    return matrix;
}

/*
 *  addVectors [private] - Add to vectors together.
 *  @param {v1} - A Vector3 object.
 *  @param {v2} - A Vector3 object.
 *
 *  @return {object} - A calculated Vector3 object.
 */
function addVectors (v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}


/*
 *  rotateVectors [private] - Rotate `v1` around `v2`.
 *  @param {v1} - A Vector3 object.
 *  @param {v2} - A Vector3 object.
 *
 *  @return {object} - A calculated Vector3 object.
 */
function rotateVector (v1, v2) {
    var x1 = v1.x,
        y1 = v1.y,
        z1 = v1.z,
        angleX = v2.x / 2,
        angleY = v2.y / 2,
        angleZ = v2.z / 2,

        cr = Math.cos(angleX),
        cp = Math.cos(angleY),
        cy = Math.cos(angleZ),
        sr = Math.sin(angleX),
        sp = Math.sin(angleY),
        sy = Math.sin(angleZ),

        w = cr * cp * cy + -sr * sp * -sy,
        x = sr * cp * cy - (-cr) * sp * -sy,
        y = cr * sp * cy + sr * cp * sy,
        z = cr * cp * sy - (-sr) * sp * -cy,

        m0 = 1 - 2 * ( y * y + z * z ),
        m1 = 2 * (x * y + z * w),
        m2 = 2 * (x * z - y * w),

        m4 = 2 * ( x * y - z * w ),
        m5 = 1 - 2 * ( x * x + z * z ),
        m6 = 2 * (z * y + x * w ),

        m8 = 2 * ( x * z + y * w ),
        m9 = 2 * ( y * z - x * w ),
        m10 = 1 - 2 * ( x * x + y * y );

    return {
        x: x1 * m0 + y1 * m4 + z1 * m8,
        y: x1 * m1 + y1 * m5 + z1 * m9,
        z: x1 * m2 + y1 * m6 + z1 * m10
    };
}


/*
 *  Define some Custom Events which we can use anywhere in the project.
 *  `tap`/`fastclick` - Removes the 300ms click delay for mobile.
 *  `swipeleft`/`swiperight` - Detects a swipe on the X-axis.
 *  `swipeup`/`swipedown` - Detects a swipe on the Y-axis.
 */
(function() {

    if (!d.addEventListener) return;
    
    var createEvent = function(el, name) {
        var e = d.createEvent('CustomEvent');
        e.initCustomEvent(name, true, true, el.target);
        if (!el.target.dispatchEvent(e)) e.preventDefault();
        e = null;
        return false;
    };

    var notMoved = true,
        startPos = { x: 0, y: 0 },
        endPos = { x: 0, y: 0},
        prevTarget, prevTime,
        evs = {
            touchstart: function(e) {
                startPos.x = e.touches[0].pageX;
                startPos.y = e.touches[0].pageY;
            },
            touchmove: function(e) {
                notMoved = false;
                endPos.x = e.touches[0].pageX;
                endPos.y = e.touches[0].pageY;
            },
            touchend: function(e) {
                if (notMoved) {
                    createEvent(e, 'fastclick');
                    createEvent(e, 'tap');
                    if (e.target === prevTarget) {
                        var delta = Date.now() - prevTime;
                        if (delta < 500) {
                            createEvent(e, 'doubletap');
                        }
                    }
                    prevTarget = e.target;
                    prevTime = Date.now();
                } else {
                    var x = endPos.x - startPos.x,
                        xr = Math.abs(x),
                        y = endPos.y - startPos.y,
                        yr = Math.abs(y);

                    if (Math.max(xr, yr) > 20) {
                        createEvent(e, xr > yr ? (x < 0 ? 'swipeleft' : 'swiperight') : (y < 0 ? 'swipeup' : 'swipedown'));
                        notMoved = true;
                    }
                }
            },
            touchcancel: function(e) {
                notMoved = false;
            }
        };

    for (var e in evs) {
        d.addEventListener(e, evs[e]);
    }

})();

module.exports = selector;
},{}]},{},[1]);
