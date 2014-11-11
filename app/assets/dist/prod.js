(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $ = require('./modules/utilites'); // THIS IS NOT JQUERY
var Config = require('./modules/config');
var Cube = require('./modules/cube');
var Orient = require('./modules/orient');
var Sound = require('./modules/sound');
var Messaging = require('./modules/messaging');
var Stats = require('stats');
var Interpol = require('interpol');

$.ready(function() {

    var cube = new Cube(125, 125);

    Orient(cube, determineCalculation, getAxis);

    if (Config.useAccelerometer) Orient.listen();

    var sound = new Sound('assets/sound/click.mp3');

    $('button').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            if (Config.useMessaging) Messaging.post('button_interaction');
        });
    });

    // $('input[type="text"]').forEach(function(input) {
    //     input.addEventListener('change', function() {
    //         cube.rotation[this.name] = parseInt(this.value, 10);
    //         cube.render();
    //     });
    // });

    var panel = $('.checkboxes')[0];

    $('.checkboxes a').forEach(function(a) {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            panel.classList.toggle('open');
            cube.element.classList.toggle('disabled');
            if (a.innerText === 'Open Controls') {
                a.innerText = 'Close Controls';
            } else {
                a.innerText = 'Open Controls';
            }
        });
    });

    $('input[type="checkbox"]').forEach(function(checkbox) {
        checkbox.checked = Config[checkbox.name];
        checkbox.addEventListener('change', function() {
            Config[checkbox.name] = checkbox.checked;
            switch (checkbox.name) {
                case 'useBackgrounds':
                case 'useContent':
                case 'useVideo':
                case 'useGif':
                case 'normaliseFacialRotation':
                    cube.remove();
                    cube = new Cube();
                    cube.element.addEventListener('touchstart', touchStart);
                    cube.element.classList.add('disabled');
                    cube.render();
                    Orient(cube, determineCalculation, getAxis);
                    break;
            }
        });
    });

    var fps = new Stats();
    fps.domElement.style.position = 'absolute';
    fps.domElement.style.right = '0px';
    fps.domElement.style.top = '0px';

    var ms = new Stats();
    ms.setMode(1);
    ms.domElement.style.position = 'absolute';
    ms.domElement.style.right = '80px';
    ms.domElement.style.top = '0px';

    document.body.appendChild(fps.domElement);
    document.body.appendChild(ms.domElement);

    Interpol.pipeline.add('stats', function() {
        fps.update();
        ms.update();
    });

    var bX, bY, cX, cY,
        axis, axisLR, axisUD, axisMid,
        direction, dirX, dirY, rDirection, oRDirection,
        current, change, oChange,
        hasMoved = false, changedDirection = false,
        endTween, interactedSide;

    var moveStartTime, msX, msY;

    function touchStart(e) {

        hasMoved = false;

        var touch = e.changedTouches[0];
        bX = touch.clientX;
        bY = touch.clientY;
        cX = bX;
        cY = bY;

        changedDirection = false;

        if (endTween) {
            endTween.stop();
        } else {
            interactedSide = cube.getSideFromTarget(touch.target);
        }

        current = $.extend({}, cube.rotation);

        console.log(current);

        var axisDef = getAxis();

        axisLR = axisDef.LR;
        axisUD = axisDef.UD;
        axisMid = ['X', 'Y', 'Z'].filter(function(val) {
            return val !== axisLR && val !== axisUD;
        })[0];

        velocity = amplitude = 0;
        change = oChange = 0;
        timestamp = Date.now();

        document.addEventListener('touchmove', touchMove);
        document.addEventListener('touchend', touchEnd);
    }

    function touchMove(e) {
        //e.stopPropagation();
        e.preventDefault();

        if (Config.useAccelerometer) Orient.detach();

        hasMoved = true;

        var touch = e.changedTouches[0];

        dirX = touch.clientX < cX ? 'left' : 'right';
        dirY = touch.clientY < cY ? 'up' : 'down';

        cX = touch.clientX;
        cY = touch.clientY;

        var dX = (bX - cX) / ((cube.width) / 90);
        var dY = (bY - cY) / ((cube.height) / 90);
        var adX = Math.abs(dX);
        var adY = Math.abs(dY);

        if (Math.max(adX, adY) < 1) return;

        if (!$.isDefined(axis)) {
            direction = adX > adY ? 'leftright' : 'updown';
            axis = direction === 'leftright' ? axisLR : axisUD;
            if (Config.normaliseFacialRotation) cube.normalizeOppositeSide(interactedSide, direction);
        }

        oRDirection = rDirection;
        rDirection = direction === 'leftright' ? dirX : dirY;

        if (oRDirection !== rDirection) {
            changedDirection = true;
            moveStartTime = Date.now();
            msX = cX;
            msY = cY;
        }

        change = direction === 'leftright' ? dX : dY;
        change = determineCalculation(change);

        if (!Interpol.pipeline.has('render')) {
            Interpol.pipeline.add('render', function() {
                var oldRot = cube.rotation[axis];
                var newRot = Math.round(current[axis] + change);
                var nNearest = $.nearest(newRot, 90);
                var oNearest = $.nearest(oldRot, 90);
                if (nNearest !== oNearest && Config.useSound) sound.play();
                cube.rotation[axis] = newRot;
                cube.render();
            });
        }

    }

    function touchEnd(e) {
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);

        if (!hasMoved) return;

        if (Interpol.pipeline.has('render')) Interpol.pipeline.remove('render');

        var touch = e.changedTouches[0];
        var endTime = Date.now();
        var emX = touch.clientX;
        var emY = touch.clientY;

        var dmX = emX - msX;
        var dmY = emY - msY;
        var diffDistance = direction === 'leftright' ? dmX : dmY;
        var diffTime = endTime - moveStartTime;

        diffDistance = diffDistance < 0 && (rDirection === 'right' || rDirection === 'down') ? Math.abs(diffDistance) : diffDistance;
        diffDistance = diffDistance > 0 && (rDirection === 'left' || rDirection === 'up') ? -diffDistance : diffDistance;

        var velocity = diffDistance / diffTime;
        var velMin = Math.abs(diffDistance) < (cube.width * 0.8) / 2 ? 1 : 0;

        var bV = current[axis];
        var cV = cube.rotation[axis];

        var val = $.nearest(cV, 90);
        var perc = 1;

        if (Config.useInertia) {
            val = val - determineCalculation(Math[velocity < 0 ? 'min' : 'max'](velocity < 0 ? -(velMin) : velMin, Math.round(velocity * 2)) * 90);
            perc = Math.abs(val - cV) / 90;
        } else {
            if (direction === 'updown') {
                val = (dirY === 'up') ? bV + determineCalculation(90) : bV - determineCalculation(90);
            } else {
                val = (dirX === 'left') ? bV + determineCalculation(90) : bV - determineCalculation(90);
            }
        }

        var from = { rot: cV };
        var to = { rot: val };

        var fixes = ['X', 'Y', 'Z'].filter(function(val) { return val !== axis; });
        fixes.forEach(function(val) {
            from['fix' + val] = cube.rotation[val];
            to['fix' + val] = $.nearest(cube.rotation[val], 90);
        });

        var oldV;
        endTween = Interpol.tween()
            .from(from)
            .to(to)
            .duration(Math.round(300 * perc))
            .ease(Interpol.easing.easeOutCirc)
            .step(function(obj) {
                oldV = oldV || obj.rot;
                var nNearest = $.nearest(obj.rot, 90);
                var oNearest = $.nearest(oldV, 90);
                if (nNearest !== oNearest && Config.useSound) sound.play();
                cube.rotation[axis] = obj.rot;
                fixes.forEach(function(val) {
                    cube.rotation[val] = obj['fix' + val];
                });
                cube.render();
                oldV = obj.rot;
            })
            .complete(function(obj) {
                cube.rotation[axis] = norm(obj.rot % 360);
                fixes.forEach(function(val) {
                    cube.rotation[val] = norm(obj['fix'+ val] % 360);
                });
                cube.render();
                endTween = undefined;
                axis = undefined;
                if (Config.normaliseFacialRotation) cube.normalizeFace();
                if (Config.useAccelerometer) Orient.reset(Orient.listen);
            })
            .start();

    }

    function determineCalculation(val) {
        var r = cube.rotation;
        var rX = Math.abs($.nearest(r.X, 90)),
            rY = Math.abs($.nearest(r.Y, 90));

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

    function getAxis() {
        var r = cube.rotation;

        var ncX = Math.abs($.nearest(r.X, 90));
        var ncY = Math.abs($.nearest(r.Y, 90));

        return {
            LR: ncX === 90 || ncX === 270 ? 'Z' : 'Y',
            UD: ncY === 90 || ncY === 270 ? 'Z' : 'X'
        };
    }


    function norm(deg) {
        if (deg >= 0) return deg;
        return 360 - Math.abs(deg);
    }

    
    document.addEventListener('touchmove', $.prevent);

    cube.element.addEventListener('touchstart', touchStart);
    cube.render();

});
},{"./modules/config":4,"./modules/cube":6,"./modules/messaging":9,"./modules/orient":10,"./modules/sound":14,"./modules/utilites":15,"interpol":2,"stats":3}],2:[function(require,module,exports){
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
	 *	TERMS OF USE - EASING EQUATIONS
	 * 
	 *	Open source under the BSD License. 
	 *
	 *	Copyright © 2001 Robert Penner
	 *	All rights reserved.
	 *
	 *	Redistribution and use in source and binary forms, with or without modification, 
	 *	are permitted provided that the following conditions are met:
	 *
	 *	Redistributions of source code must retain the above copyright notice, this list of 
	 *	conditions and the following disclaimer.
	 *	Redistributions in binary form must reproduce the above copyright notice, this list 
	 *	of conditions and the following disclaimer in the documentation and/or other materials 
	 *	provided with the distribution.
	 *
	 *	Neither the name of the author nor the names of contributors may be used to endorse 
	 *	or promote products derived from this software without specific prior written permission.
	 *
	 *	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
	 *	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	 *	MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
	 *	COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	 *	EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
	 *	GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
	 *	AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 *	NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
	 *	OF THE POSSIBILITY OF SUCH DAMAGE. 
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
		return	w.requestAnimationFrame			||
				w.webkitRequestAnimationFrame	||
				w.mozRequestAnimationFrame		||
				function(callback, element) {
					var currTime = new Date().getTime();
					var timeToCall = Math.max(0, 16 - (currTime - _.rafLast));
					var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
					_.rafLast = currTime + timeToCall;
					return id;
				};
	})();

	_.cancelAnimFrame = (function() {
		return	w.cancelAnimationFrame				||
				w.cancelRequestAnimationFrame		||
				w.webkitCancelAnimationFrame		||
				w.webkitCancelRequestAnimationFrame	||
				w.mozCancelAnimationFrame			||
				w.mozCancelRequestAnimationFrame	||
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
				for (var n in _t.pipeline) {
					_t.pipeline[n]();
				}
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
		start : function() {
			var _t = this;
			if (!_t.canStart) return _t;
			if (_t.delayDuration > 0 && !_t.isDelayed) {
				setTimeout(function() {
					_t.start();
				}, _t.delayDuration);
				_t.isDelayed = true;
				return _t;
			}

			var	stepDuration = 1000 / _.fps,
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
module.exports = {
	useSound : false,
	useInertia : false,
	useMessaging : false,
	useAccelerometer : false,
	useBackgrounds : false,
	useContent : false,
	useVideo : false,
	useGif : false,
	normaliseFacialRotation : false
};
},{}],5:[function(require,module,exports){
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
},{"../../config":4,"../../messaging":9,"../../utilites":15}],6:[function(require,module,exports){
var $ = require('../utilites');
var Side = require('./side');
var matrix = require('./matrix');

function Cube(width, height, target) {
	
	this.width = width || 250;
	this.height = height || 250;
	this.sides = [];
	this.element = $.getElement('div', 'cube', {}, {
		width: this.width + 'px',
		height: this.height + 'px'
	});
	this.rotation = {
		X: 0,
		Y: 0,
		Z: 0
	};

	var offset = this.width / 2;

	for (var i = 0; i < 6; i++) {
		var side = new Side(this.width, this.height, i);
		this.sides.push(side);
		this.element.appendChild(side.element);

		side.rotation.Y = i === 1 ? 180 : i === 2 ? 90 : i === 3 ? -90 : 0;
		side.rotation.X = i === 4 ? 90 : i === 5 ? -90 : 0;

		side.render();
	}

	target = target || $('[role="main"]')[0];

	target.appendChild(this.element);
	target.style[$.CSS_TRANSFORM] = 'translateZ(-' + offset + 'px)';

}

Cube.prototype.render = function() {
	this.element.style[$.CSS_TRANSFORM] =	'rotateX(' + this.rotation.X + 'deg) ' +
											'rotateY(' + this.rotation.Y + 'deg) ' +
											'rotateZ(' + this.rotation.Z + 'deg) translateZ(0)';
};

Cube.prototype.normalizeOppositeSide = function(side, direction) {
	if (direction !== 'updown') return;

	var sIndex = parseInt(side.getAttribute('side'), 10) - 1;
	var oIndex = $.isEven(sIndex) ? sIndex + 1 : sIndex - 1;
	var oSide = this.sides[oIndex];

	oSide.rotation.Z = oSide.rZ + 180;
	oSide.render();

};

Cube.prototype.normalizeFace = function() {
	var r = this.rotation;

	var nX = Math.abs($.nearest(r.X, 90) % 360),
		nY = Math.abs($.nearest(r.Y, 90) % 360),
		nZ = Math.abs($.nearest(r.Z, 90) % 360);

	for (var i = this.sides.length - 1; i >= 0; i--) {
		var s = this.sides[i];
		s.rotation.Z = matrix[i][nX][nY][nZ];
		s.render();
	}

	// this.sides.forEach(function(s, i) {
	// 	s.rotation.Z = matrix[i][nX][nY][nZ];
	// 	s.render();
	// });

};

Cube.prototype.getSideFromTarget = function(target) {
	var el = target;
	while (!/side/.test(el.className)) {
		el = el.parentNode;
	}
	return el;
};

Cube.prototype.remove = function() {
	this.element.parentNode.removeChild(this.element);
};

module.exports = Cube;
},{"../utilites":15,"./matrix":7,"./side":8}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
var $ = require('../utilites');
var content = require('./content');
var Config = require('../config');

function populateElement(elem) {
	// temp
	var c = content.sides[this.index];
	
	if (Config.useBackgrounds) {
		var img = new Image();
		img.src = $.format(content.background, { i: this.index + 1 });
		img.width = this.width;
		img.height = this.height;

		elem.appendChild(img);
	}

	if (Config.useContent) {
		var span = document.createElement('span');
		span.innerHTML = c.html();

		elem.appendChild(span);

		c.onload(elem);
	}

	

	return elem;
}

function Side(width, height, index) {
	this.width = width;
	this.height = height;
	this.offset = this.width / 2;
	this.index = index;
	this.element =	populateElement.call(this,
						$.getElement(
							'div',
							'side no' + (this.index + 1),
							{
								side : (this.index + 1)
							},
							{
								width : this.width + 'px',
								height: this.height + 'px'
							}
						)
					);
	this.rotation = {
		X: 0,
		Y: 0,
		Z: 0
	};
	this.rZ = this.rotation.Z;
}

Side.prototype.render = function() {
	this.rZ = this.rotation.Z;
	this.element.style[$.CSS_TRANSFORM] = 'rotateX(' + this.rotation.X + 'deg) rotateY(' + this.rotation.Y + 'deg) rotateZ(' + this.rotation.Z + 'deg) translateZ(' + this.offset + 'px)';
};

module.exports = Side;
},{"../config":4,"../utilites":15,"./content":5}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
var $ = require('../utilites');
var ValueBuffer = require('./valuebuffer');
var Interpol = require('interpol');
var cube, deterCalc, getAxis;
var gammaBuffer, betaBuffer;
var initialValues = { gamma: 0, beta: 0 };

function handler(e) {
	gammaBuffer.update(initialValues.gamma - e.gamma);
	betaBuffer.update(initialValues.beta - e.beta);
}

function render() {
	var axis = getAxis();
	var betaAvg = betaBuffer.smooth(4.3);
	var gammaAvg = gammaBuffer.smooth(4.3);
	cube.rotation[axis.UD] = $.nearest(cube.rotation[axis.UD], 90) + deterCalc(Math[betaAvg > 0 ? 'min' : 'max'](betaAvg > 0 ? 30 : -30, betaAvg / 1.2));
	cube.rotation[axis.LR] = $.nearest(cube.rotation[axis.LR], 90) - deterCalc(Math[gammaAvg > 0 ? 'min' : 'max'](gammaAvg > 0 ? 30 : -30, gammaAvg / 1.2));
	cube.render();
}

function getInitialValues(callback) {
	window.addEventListener('deviceorientation', function init(e) {
		initialValues.gamma = e.gamma;
		initialValues.beta = e.beta;
		window.removeEventListener('deviceorientation', init);
		if (callback) callback();
	});
}

function Orient(c, dc, ga) {
	cube = c;
	deterCalc = dc;
	getAxis = ga;
	gammaBuffer = new ValueBuffer(10);
	betaBuffer = new ValueBuffer(10);
	getInitialValues();
	return Orient;
}

Orient.listen = function(reset) {
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
	betaBuffer.clear();
	gammaBuffer.clear();
	getInitialValues(fn);
	return Orient;
};


module.exports = Orient;
},{"../utilites":15,"./valuebuffer":11,"interpol":2}],11:[function(require,module,exports){
function ValueBuffer(samples) {
	this.samples = samples;
	this.initBuffer();
}

ValueBuffer.prototype.initBuffer = function() {
	this.index = 0;
	this.buffer = [];
	this.value = 0;
	for (var i = 0; i < this.samples; i++) this.buffer.push(0);
};

ValueBuffer.prototype.update = function(val) {
	var last = this.buffer[this.index];
	var delta = val - last;
	this.index++;
	if (this.index === this.samples) this.index = 0;
	this.buffer[this.index] = delta;
};

ValueBuffer.prototype.sum = function() {
	return this.buffer.reduce(function(prev, val) {
		return prev + val;
	}, 0);
};

ValueBuffer.prototype.sumPos = function() {
	return this.buffer.reduce(function(prev, val) {
		return prev + (val > 0 ? val : 0);
	}, 0);
};

ValueBuffer.prototype.sumNeg = function() {
	return this.buffer.reduce(function(prev, val) {
		return prev + (val < 0 ? val : 0);
	}, 0);
};

ValueBuffer.prototype.average = function() {
	return this.sum() / this.samples;
};

ValueBuffer.prototype.smooth = function(smoothing) {
	this.value = this.buffer[0];
	for (var i = 1; i < this.samples; i++) {
		this.value += (this.buffer[i] - this.value) / smoothing;
	}
	return this.value;
};

ValueBuffer.prototype.clear = function() {
	for (var i = 0; i < this.samples; i++) this.buffer.push(0);
	this.index = 0;
};

ValueBuffer.prototype.last = function() {
	return this.buffer[this.index];
};

module.exports = ValueBuffer;

},{}],12:[function(require,module,exports){
var AudioContext = require('./context');

var context = new AudioContext();

var BufferLoader = function(sources, complete) {
    this.context = context;
    this.sources = sources;
    this.onload = complete;
    this.bufferList = [];
    this.loadCount = 0;
};

BufferLoader.prototype.loadBuffer = function(url, index) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {

        loader.context.decodeAudioData(request.response, function(buffer) {
            loader.bufferList[index] = buffer;

            if (++loader.loadCount == loader.sources.length) {
                this.context = null;
                context = null;
                loader.onload(loader.bufferList);
            }

        }, function(e) {
            console.error('error decoding file data: ' + url);
        });
        
    };

    request.onerror = function() {
        console.error('BufferLoader: XHR error');
    };

    request.send();
};

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.sources.length; ++i) {
        this.loadBuffer(this.sources[i], i);
    }
};

module.exports = BufferLoader;
},{"./context":13}],13:[function(require,module,exports){
module.exports = window.AudioContext || window.webAudioContext || window.webkitAudioContext;
},{}],14:[function(require,module,exports){
var AudioContext = require('./context');
var BufferLoader = require('./bufferloader');

var context = new AudioContext();

function Sound(url) {

	var buffer, isLoaded = false;

	var loader = new BufferLoader([url], function(buffers) {
		isLoaded = true;
		buffer = buffers.pop();
	});

	loader.load();

	this.play = function() {
		if (!isLoaded) return;
		var source = context.createBufferSource();
		source.buffer = buffer;
		source.onended = function() {
			source = null;
		};
		source.connect(context.destination);
		source.start(0);
	};

}

module.exports = Sound;


},{"./bufferloader":12,"./context":13}],15:[function(require,module,exports){
var w = window,
	d = document;

function _getFirstSupported(arr) {
    var div = document.createElement('div');
    var ven = null;
    arr.forEach(function(vendor) {
         if (typeof div.style[vendor] !== 'undefined') ven = vendor;
    });

    return ven;
}

function selector(sel, context) {
	return Array.prototype.slice.call((context || d).querySelectorAll(sel));
}

selector.ready = function(fn) {
	if (d.readyState === 'complete') return setTimeout(fn, 1);
	w.addEventListener('DOMContentLoaded', fn);
};

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

selector.prevent = function(e) {
    e.preventDefault();
};

selector.format = function(str, obj) {
    return str.toString().replace(/\{([^}]+)\}/g, function(match, group) {
        return obj[group];
    });
};

selector.nearest = function(val, factor) {
	return Math.round(val / factor) * factor;
};

selector.isEven = function(num) {
    return num % 2 === 0;
};

selector.isOdd = function(num) {
    return num % 2 !== 0;
};

selector.isDefined = function(val) {
    return typeof val !== 'undefined';
};

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

selector.CSS_TRANSFORM = (function() {
    var arr = ' ms Moz Webkit O'.split(' ').map(function(prefix) {
        return prefix === '' ? 'transform' : prefix + 'Transform';
    });
    return _getFirstSupported(arr);
})();

module.exports = selector;
},{}]},{},[1]);
