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