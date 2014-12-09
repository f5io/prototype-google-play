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
    var CUBE_WIDTH = /* $.windowWidth(), */250,
        HALF_CUBE_WIDTH = CUBE_WIDTH / 2,
        CONTAINER_PERSPECTIVE = (2 * CUBE_WIDTH) + 50;

    /* Cache the views */
    var containerView = $('[role="container"]')[0],
        phoneView = $('[role="phone"]')[0],
        lightView = $('[role="light"]')[0],
        mainView = $('[role="main"]')[0],
        cubeView = $('[role="cube"]')[0],
        loadView = $('[role="loader"]')[0],
        bgView = $('[role="background"]')[0];

    containerView.style[$.CSS_PERSPECTIVE] = CONTAINER_PERSPECTIVE + 'px';

    var pre = Config.global.isCeltra ? Config.BASE_URL : '';
    
    /* Let's preload all the assets we are going to need */
    AssetManager.add([
        pre + 'assets/sound/click.mp3',
        pre + 'assets/img/playlogo-sml.png',
        pre + 'assets/img/cubes/main/side1.jpg',
        pre + 'assets/img/cubes/main/side2.jpg',
        pre + 'assets/img/cubes/main/side3.jpg',
        pre + 'assets/img/cubes/main/side4.jpg',
        pre + 'assets/img/cubes/main/side5.jpg',
        pre + 'assets/img/cubes/main/side6.jpg'
    ]).preload().then(function() {

        loadView.className = 'off';

        /* All assets are preloaded */
        var cubes = {}, shadow,
            bigcube, bigrot;
            
        /* Initialise the Debug Panel */
        Debug.init();

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
                /* Use `cropLargeFaces` to remove the need for other assets */
                cube.init(HALF_CUBE_WIDTH, HALF_CUBE_WIDTH, i, 'cube0' + (i + 1), cubeContainer, { cropLargeFaces: true, castShadow: false });
                cubes[cube.id] = cube;
                cube.element.style.left = $.isOdd(i + 1) ? '-' + HALF_CUBE_WIDTH + 'px' : HALF_CUBE_WIDTH + 'px';
                cube.element.style.top = i < 2 ? '-' + HALF_CUBE_WIDTH + 'px' : HALF_CUBE_WIDTH + 'px';

                // cube.rotation.X = $.getRandomRotation([0, 180]);
                // cube.rotation.Y = $.getRandomRotation([90, 270]);
                // cube.rotation.Z = $.getRandomRotation();

                cube.render();
                if (cube.config.normaliseFacialRotation) cube.getNormalisedFaceRotation(cube.rotation);

                animateCubeIn(cube, i);
                configs.push(cube);
            }

            shadow = Object.create(Shadow);
            shadow.init(CUBE_WIDTH, CUBE_WIDTH, 0, 'shadow', cubeView);
            shadow.render();
            animateShadowIn(shadow);

            Debug.defineCubeProperties(configs);
        }

        /*
         *  initialiseBigCube - Initialises the single large cube and passes
         *  its config into the Debug panel.
         */
        function initialiseBigCube(flourish) {
            var cubeContainer = $.getElement('div', 'cube-container', {}, {});
            cubeView.appendChild(cubeContainer);
            bigcube = Object.create(Cube);
            bigcube.init(CUBE_WIDTH, CUBE_WIDTH, 0, 'main', cubeContainer, {
                useInertia: true,
                useBackgrounds: true,
                useContent: false,
                isSequential: false,
                normaliseFacialRotation: true
            });
            bigcube.rotation = bigrot || bigcube.rotation;
            bigcube.getNormalisedFaceRotation(bigcube.rotation, true);
            bigcube.render();

            Debug.defineCubeProperties([bigcube]);

            if (flourish) animateCubeFaceMatchComplete(bigcube);
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
        function animateCubeIn(cube, index) {
            var container = cube.target,
                numOfRotationsToDo = 3;

            var from = -$.windowHeight(),
                to = 0;

            container.style[$.CSS_TRANSFORM] += ' translateY(' + from + 'px)';

            Interpol.tween()
                .delay((4 - index) * 200)
                .from(from)
                .to(to)
                .ease(Interpol.easing[index < 2 ? 'easeOutCirc' : 'easeOutBack'])
                .step(function(val) {
                    container.style[$.CSS_TRANSFORM] = container.style[$.CSS_TRANSFORM].replace(/translateY\(.+\)/g, function() {
                        return 'translateY(' + val + 'px)';
                    });
                })
                .complete(recursiveRotate)
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
                        //cube.rotation[axis] = $.norm($.nearest(val, 90) % 360);
                        if (cube.config.normaliseFacialRotation) cube.getNormalisedFaceRotation(cube.rotation);
                        recursiveRotate();
                    })
                    .start(function() {
                        sV = cube.rotation[axis];
                    });
            }
        }

        /*
         *  animateCubeFaceMatchComplete [private] - Animate a flourish when the user completes the face matching.
         *  @param {cube} - The Cube class to animate.
         */
        function animateCubeFaceMatchComplete(cube) {
            var currentOffset = -(cube.width / 2);
            var from = { shadow: 0, cube: currentOffset },
                to = { shadow: 40, cube: currentOffset + 40 };

            var axisDef = cube.getAxisDefinition(cube.rotation);

            Interpol.tween()
                .duration(400)
                .from(from)
                .to(to)
                .ease(Interpol.easing.easeInOutBack)
                .step(function(val) {
                    cube.target.style[$.CSS_TRANSFORM] = 'translateZ(' + val.cube + 'px)';
                    cube.shadow.translate.Y = val.shadow;

                    cube.shadow.render();
                })
                .complete(function() {
                    if (!this.isReversed) this.reverse();
                })
                .start();
        }

        /*
         *  animateShadowIn [private] - Animate the shadow in from a scale and opacity of 0.
         *  @param {shadow} - The Shadow class to animate.
         */
        function animateShadowIn(shadow) {
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
