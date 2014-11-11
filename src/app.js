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