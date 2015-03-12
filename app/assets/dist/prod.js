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
var Messaging = require('./modules/messaging');
var AssetManager = require('./modules/assetmanager');
var Debug = require('./modules/debug');

var Tracking = require('./modules/tracking');

/* Import Libraries */
var Interpol = require('interpol'); // https://github.com/f5io/interpol.js - Slightly modified, sorry there's no docs.

function init(ctx, unit, initialSection, language) {
    initialSection = initialSection || Config.global.defaultEntry;
    language = language || Config.global.defaultLanguage;
    Config.global.language = language;
    Config.global.entry = initialSection;

    if (Config.global.isCeltra) Tracking.init(ctx, window.Creative, unit);

    Tracking.trackEvent('ad-initialized');

    /* Constants */
    var CUBE_WIDTH = Math.min(460, Math.round($.windowWidth() * 0.8)), /*250,*/
        HALF_CUBE_WIDTH = CUBE_WIDTH / 2,
        CONTAINER_PERSPECTIVE = (2 * CUBE_WIDTH) + 50,
        DIRECTION_LEFT = 'left',
        DIRECTION_RIGHT = 'right',
        ANIMATE_IN = 'in',
        ANIMATE_OUT = 'out';

    /* Cache the views */
    var containerView = $('[role="container"]')[0],
        arrowView = $('[role="arrows"]')[0],
        lightView = $('[role="light"]')[0],
        mainView = $('[role="main"]')[0],
        cubeView = $('[role="cube"]')[0],
        menuView = $('[role="menu"]')[0],
        loadView = $('[role="loader"]')[0],
        bgView = $('[role="background"]')[0];

    containerView.style[$.CSS_PERSPECTIVE] = CONTAINER_PERSPECTIVE + 'px';

    var pre = Config.global.isCeltra ? Config.BASE_URL : '';
    
    /* Let's preload all the assets we are going to need */
    AssetManager.load([
        pre + 'assets/sound/click.mp3',
        pre + 'assets/img/cubes/' + language + '/' + initialSection + '/side1.jpg',
        pre + 'assets/img/cubes/' + language + '/' + initialSection + '/side2.jpg',
        pre + 'assets/img/cubes/' + language + '/' + initialSection + '/side3.jpg',
        pre + 'assets/img/cubes/' + language + '/' + initialSection + '/side4.jpg',
        pre + 'assets/img/cubes/' + language + '/' + initialSection + '/side5.jpg',
        pre + 'assets/img/cubes/' + language + '/' + initialSection + '/side6.jpg'
    ]).then(function() {

        Tracking.trackEvent('cube-loaded-' + initialSection);

        // loadView.className = 'off';

        /* First cube assets are preloaded */
        var cubes = {}, shadow,
            currentCube, currentIndex = 0;

        var cubeNames = ['music', 'books', 'apps', 'movies'],
            menuItems = [];
            
        menuView.querySelector('.' + initialSection).classList.add('selected');
        containerView.className = menuView.className = 'border-' + initialSection;
        currentIndex = cubeNames.indexOf(initialSection);

        /* When the debug panel is open prevent pointer events on the main view */
        $.emitter.on('debug_panel', function(isOpen) {
            mainView.classList[isOpen ? 'add' : 'remove']('covered');
        });

        currentCube = createCube(cubeNames[currentIndex]);

        cubeNames.forEach(function(name, i) {
            var el = menuView.querySelector('.' + name);
            menuItems.push(el);

            el.addEventListener('touchend', function(e) {
                if (el.classList.contains('selected')) return;

                Tracking.trackEvent('menu-tapped-' + name, true);

                menuItems.forEach(function(el) {
                    el.classList.remove('selected');
                });
                containerView.className = menuView.className = 'border-' + name;
                el.classList.add('selected');
                var direction = i < currentIndex ? DIRECTION_LEFT : DIRECTION_RIGHT,
                    offDirection = i < currentIndex ? DIRECTION_RIGHT : DIRECTION_LEFT;
                currentIndex = i;

                loadView.classList.remove('off');
                var reshowArrows = !arrowView.classList.contains('off');
                arrowView.classList.add('off');
                animateCube(ANIMATE_OUT, currentCube, offDirection).then(function() {
                    var arr = [];
                    for (var x = 1, len = 6; x <= len; x++) {
                        arr.push(pre + 'assets/img/cubes/' + language + '/' + name + '/side' + x + '.jpg');
                    }
                    AssetManager.load(arr).then(function() {
                        Tracking.trackEvent('cube-loaded-' + name);
                        loadView.classList.add('off');
                        if (reshowArrows) arrowView.classList.remove('off');
                        currentCube = createCube(name, direction);
                    });
                });
            });
        });

        function createCube(name, direction) {
            direction = direction || DIRECTION_RIGHT;
            var cubeContainer = $.getElement('div', 'cube-container', {}, {});
            cubeView.appendChild(cubeContainer);
            var cube = Object.create(Cube);
            cube.init(CUBE_WIDTH, CUBE_WIDTH, 0, name, cubeContainer, {
                autoListen: false,
                useInertia: false,
                useBackgrounds: true,
                useContent: true,
                normaliseFacialRotation: true
            });
            cube.getNormalisedFaceRotation(cube.rotation, true);
            cube.render();

            animateCube(ANIMATE_IN, cube, direction);
            Debug.defineCubeProperties([cube]);
            return cube;
        }

        function animateCube(io, cube, direction) {
            return new Promise(function(resolve, reject) {
                var container = cube.target,
                    shadow = cube.shadow,
                    offset = $.windowWidth() * 1.2;

                var fn = function() {
                    arrowView.classList.remove('off');
                    var $decouple = $.emitter.on('first_cube_interaction', function() {
                        arrowView.classList.add('off');
                        $decouple();
                    });
                    cube.addInteractionListener();
                };

                if (io === ANIMATE_IN && !currentCube) {
                    fn = previewRotate;
                } else if (io === ANIMATE_OUT) {
                    fn = function() {
                        container.parentNode.removeChild(shadow.element);
                        container.parentNode.removeChild(container);
                        cube = null;
                    };
                }

                var from = io === ANIMATE_OUT ? 0 : direction === DIRECTION_LEFT ? -offset : offset,
                    to = io === ANIMATE_IN ? 0 : direction === DIRECTION_LEFT ? -offset : offset;

                container.style[$.CSS_TRANSFORM] += ' translateX(' + from + 'px)';
                shadow.translate.X = from;
                shadow.render();

                Interpol.tween()
                    .from(from)
                    .to(to)
                    .ease(Interpol.easing[io === ANIMATE_IN ? 'easeOutCirc' : 'easeInCirc'])
                    .step(function(val) {
                        container.style[$.CSS_TRANSFORM] = container.style[$.CSS_TRANSFORM].replace(/translateX\(.+\)/g, function() {
                            return 'translateX(' + val + 'px)';
                        });
                        shadow.translate.X = val * 1.1;
                        shadow.render();
                    })
                    .complete(function() {
                        fn(cube);
                        resolve();
                    })
                    .start();
            });
        }

        function previewRotate(cube) {
            var sV = 0, oldV,
                axisDef = cube.getAxisDefinition(cube.rotation);

            function recursiveRotate(axis) {
                Interpol.tween()
                    .to(360)
                    .delay(400)
                    .duration(1000)
                    .ease(Interpol.easing.easeInOutQuad)
                    .step(function(val) {
                        oldV = oldV || val;
                        var nNearest = $.nearest(val, 90);
                        var oNearest = $.nearest(oldV, 90);
                        /* 
                         * If the `nNearest` and `oNearest` do not match, we know the Cube
                         * has passed a 45degree rotation and therefore we should play the sound.
                         */
                        if (nNearest !== oNearest && Config.global.useSound) cube.sound.play();
                        cube.rotation[axisDef[axis]] = sV + val;
                        cube.render();
                        oldV = val;
                    })
                    .complete(function() {
                        if (axis !== 'LR') {
                            loadView.classList.add('off');
                            arrowView.classList.remove('off');
                            var $decouple = $.emitter.on('first_cube_interaction', function() {
                                arrowView.classList.add('off');
                                $decouple();
                            });
                            cube.addInteractionListener();
                            return;
                        }
                        oldV = undefined;
                        cube.forceRotationOfOppositeForFirstFace();
                        recursiveRotate('UD');
                    })
                    .start();
            }

            recursiveRotate('LR');
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

},{"./modules/assetmanager":5,"./modules/config":9,"./modules/cube":13,"./modules/debug":17,"./modules/messaging":18,"./modules/tracking":19,"./modules/utilities":20,"interpol":2}],2:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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

/* Define variables */
var buffers = {},
    imageRegex = /\.(gif|jpeg|jpg|png)$/,
    soundRegex = /\.(mp3|mp4|ogg)$/;

function filterByRegex(regex) {
    return function(asset) {
        return regex.test(asset);
    };
}

function filterAndDefineInBuffersAs(assetType) {
    return function(asset) {
        if (!(asset in buffers)) {
            buffers[asset] = assetType(asset);
            return true;
        } else {
            return false;
        }
    };
}

var AssetManager = {};

AssetManager.load = function(urls) {
    var assets = [],
        sounds, images;
    if (typeof urls === 'string') {
        assets.push(urls);
    } else {
        assets = assets.concat(urls);
    }

    sounds = assets.filter(filterByRegex(soundRegex))
        .filter(filterAndDefineInBuffersAs(SoundAsset));
    images = assets.filter(filterByRegex(imageRegex))
        .filter(filterAndDefineInBuffersAs(ImageAsset));

    var imageLoader = new BufferLoader(images, ImageAsset),
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
    if (url in buffers) return buffers[url];
};

module.exports = AssetManager;
},{"./image":4,"./loader":6,"./sound":8}],6:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Buffer Loader
 * @author: Joe Harlow
 *
 */

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
},{}],7:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Audio Context Wrapper
 * @author: Joe Harlow
 *
 */

module.exports = window.AudioContext || window.webAudioContext || window.webkitAudioContext;
},{}],8:[function(require,module,exports){
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


},{"./context":7}],9:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Configuration
 * @author: Joe Harlow
 *
 */

/* General Utilites */
var $ = require('./utilities');

var BASE_URL = 'http://playful-discovery.s3-website-eu-west-1.amazonaws.com/';

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
global.defaultLanguage = 'en';
global.defaultEntry = 'music';

/* Individual cube specific configuration variables */
var cube = {
    castShadow: true,
    autoListen: true,
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
},{"./utilities":20}],10:[function(require,module,exports){
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
},{"../utilities":20}],11:[function(require,module,exports){
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
},{"../../assetmanager":5,"../../config":9,"../../messaging":18,"../../tracking":19,"../../utilities":20}],12:[function(require,module,exports){
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
    var lang = Config.global.language;

    if (this.parent.config.useBackgrounds) {
        var img = new Image();
        var name = this.parent.config.cropLargeFaces ? 'main' : this.name;
        var str = Config.global.isCeltra ? Config.BASE_URL + content.background : content.background;
        var url = $.format(str, { i: this.index + 1, name: name, language: lang });
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

    if (this.parent.config.useContent && this.index !== 0) {
        // var c = content.sides[this.name][this.index];
        var span = document.createElement('span');
        span.className = 'content';

        var html = content.html(this.parent.config);
        var section = content[this.parent.name];
        var id = section[lang][this.index];
        var link = $.format(section._base, { id: id });

        span.innerHTML = $.format(html, { link: link });

        elem.appendChild(span);

        content.onload(elem, this.parent.config);
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
    var lang = Config.global.language;

    if (this.parent.config.useBackgrounds) {
        var img = $('img', this.element)[0];
        var str = Config.global.isCeltra ? Config.BASE_URL + content.background : content.background; 
        var url = $.format(str, { i: index + 1, name: this.name, language: lang });
        img.src = AssetManager.get(url).uri();
    }

    if (this.parent.config.useContent) {
        index = index >= content.sides[this.name].length ? 0 : index;
        var c = content.sides[this.name][index];
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


},{"../assetmanager":5,"../config":9,"../utilities":20,"./common":10,"./content":11}],13:[function(require,module,exports){
/*
 *
 * Google Ad Prototype 2014 - Cube Class
 * @author: Joe Harlow
 *
 */

/* General Utilities */
var $ = require('../utilities');
var Tracking = require('../tracking');

/* Import modules */
var Common = require('./common');
var matrix = require('./matrix');
var Face = require('./face');
var Shadow = require('./shadow');
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
    this.shadow.init(this.width * 0.8, this.height * 0.8, this.index, this.name, this.target.parentNode, this);
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
    if (this.config.autoListen) addInteractionListener();    

    /* Expose private functions as public on the Cube */
    this.getFaceFromTarget = getFaceFromTarget;
    this.getNormalisedFaceRotation = normaliseFaces;
    this.rerenderFaces = renderFaces.bind(this, true);
    this.resetNormalisedFaces = resetNormalisedFaces;
    this.getAxisDefinition = getAxis;
    this.changeCubeNameChangeInvisibleFacesAndRotate = changeCubeNameChangeInvisibleFacesAndRotate;
    this.forceRotationOfOppositeForFirstFace = rotateOppositeFace.bind(this, this.faces[0], 'updown');
    this.renderShadow = renderShadow;
    this.addInteractionListener = addInteractionListener;

    /* Private variables */
    var startX, startY, startT,
        currentX, currentY,
        axisDef, axis,
        direction, dirX, dirY,
        rDirection, oRDirection,
        current = $.clone(this.rotation), change,
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

    function addInteractionListener() {
        _self.element.addEventListener('touchstart', touchStart);
        _self.element.addEventListener('touchstart', function onlyOnce() {
            $.emitter.emit('first_cube_interaction');
            _self.element.removeEventListener('touchstart', onlyOnce);
        });
    }

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

    function renderShadow() {
        var axisDef = getAxis(_self.rotation);

        ['LR', 'UD'].forEach(function(axisName) {
            var axis = axisDef[axisName],
                rot = _self.rotation[axis],
                nearest = $.nearest(rot, 90);

            var rotVal = Math.abs(rot - nearest) / 45;
            var scaleVal = _self.shadow.originalScale + ((rotVal * _self.shadow.hypRatio) / 2);
            _self.shadow.scale[axisName === 'LR' ? 'X' : 'Y'] = scaleVal;
        });
        _self.shadow.render();
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

        Tracking.trackEvent('cube-interaction-rotate-' + rDirection, true);

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

    if (this.config.castShadow) this.renderShadow();

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
},{"../assetmanager":5,"../config":9,"../tracking":19,"../utilities":20,"./common":10,"./face":12,"./matrix":14,"./shadow":15,"./vect3":16,"interpol":2}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
    this.originalScale = 2;
    this.parent = parent;
    this.scale = { X : this.originalScale, Y : this.originalScale };
    this.opacity = 0.5;

    /* `super` the Base Class */
    Common.init.apply(this, arguments);

    // this.rotation.X = 90;
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
},{"../config":9,"../utilities":20,"./common":10}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{"../config":9,"../utilities":20,"interpol":2,"stats":3}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
var $ = require('./utilities');
var Config = require('./config');
var Creative, CreativeUnit, ctx;

var EXIT_TRACK = 'cta-exit-lang:{language}-start:{entry}-url:{href}';

var Tracking = {
    init: function(ct, creative, unit) {
        Creative = creative;
        CreativeUnit = unit;
        ctx = ct;
    },
    trackEvent: function(event, isInteraction) {
        if (!Config.global.isCeltra) {
            console.log('Tracking :: ' + event);
            return;
        }
        if (isInteraction) ctx.trackUserInteraction();
        Creative.trackCustomEventAction(ctx, { name: event }, function() {});
    },
    goToURL: function(href) {
        this.trackEvent($.format(EXIT_TRACK, $.extend({ href: href }, Config.global)));
        if (!Config.global.isCeltra) {
            console.log('Go To URL :: ' + href);
            return;
        }
        CreativeUnit.goToURLAction(ctx, { url: href, reportLabel: href }, function() {});
    }
};

module.exports = Tracking;
},{"./config":9,"./utilities":20}],20:[function(require,module,exports){
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
