/*
 *
 * Google Ad Prototype 2014
 * @author: Joe Harlow
 *
 * All code (except libs) (c) Copyright 2014 - Essence Digital. Please do not reproduce.
 */

/* General Utilities */
var $ = require('./modules/utilities'); // THIS IS NOT JQUERY

/* Import our modules */
var Config = require('./modules/config');
var Cube = require('./modules/cube');
var Orient = require('./modules/orient');
var Messaging = require('./modules/messaging');
var Background = require('./modules/background');
var AssetManager = require('./modules/assetmanager');
var Debug = require('./modules/debug');

/* Import Libraries */
var Stats = require('stats'); // https://github.com/mrdoob/stats.js
var Interpol = require('interpol'); // https://github.com/f5io/interpol.js - Slightly modified, sorry there's no docs.

/* DOM Ready Event Handler */
$.ready(function() {

    /* Cache the views */
    var mainView = $('[role="main"]')[0],
        cubeView = $('[role="cube"]')[0],
        loadView = $('[role="loader"]')[0],
        bgView = $('[role="background"]')[0];
    
    /* Let's preload all the assets we are going to need */
    AssetManager.add([
        'assets/sound/click.mp3',
        'assets/img/playlogo-sml.png',
        'assets/img/cubes/main/side1.jpg',
        'assets/img/cubes/main/side2.jpg',
        'assets/img/cubes/main/side3.jpg',
        'assets/img/cubes/main/side4.jpg',
        'assets/img/cubes/main/side5.jpg',
        'assets/img/cubes/main/side6.jpg',
        'assets/img/cubes/cube01/side1.jpg',
        'assets/img/cubes/cube01/side2.jpg',
        'assets/img/cubes/cube01/side3.jpg',
        'assets/img/cubes/cube01/side4.jpg',
        'assets/img/cubes/cube01/side5.jpg',
        'assets/img/cubes/cube01/side6.jpg',
        'assets/img/cubes/cube02/side1.jpg',
        'assets/img/cubes/cube02/side2.jpg',
        'assets/img/cubes/cube02/side3.jpg',
        'assets/img/cubes/cube02/side4.jpg',
        'assets/img/cubes/cube02/side5.jpg',
        'assets/img/cubes/cube02/side6.jpg',
        'assets/img/cubes/cube03/side1.jpg',
        'assets/img/cubes/cube03/side2.jpg',
        'assets/img/cubes/cube03/side3.jpg',
        'assets/img/cubes/cube03/side4.jpg',
        'assets/img/cubes/cube03/side5.jpg',
        'assets/img/cubes/cube03/side6.jpg',
        'assets/img/cubes/cube04/side1.jpg',
        'assets/img/cubes/cube04/side2.jpg',
        'assets/img/cubes/cube04/side3.jpg',
        'assets/img/cubes/cube04/side4.jpg',
        'assets/img/cubes/cube04/side5.jpg',
        'assets/img/cubes/cube04/side6.jpg'
    ]).preload().then(function() {

        loadView.className = 'off';

        /* All assets are preloaded */
        var cubes = {},
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
                else initialiseBigCube();
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
                cube.init(125, 125, i, 'cube0' + (i + 1), cubeContainer);
                cubes[cube.id] = cube;
                cube.element.style.left = $.isOdd(i + 1) ? '-125px' : '125px';
                cube.element.style.top = i < 2 ? '-125px' : '125px';
                if (Config.global.useGamification) {
                    cube.rotation.X = $.getRandomRotation([0, 180]);
                    cube.rotation.Y = $.getRandomRotation([90, 270]);
                    cube.rotation.Z = $.getRandomRotation();
                    cube.render();
                    if (cube.config.normaliseFacialRotation) cube.getNormalisedFaceRotation(cube.rotation);
                }
                animateCubeIn(cubeContainer, i);
                configs.push(cube);
            }

            Debug.defineCubeProperties(configs);
        }

        /*
         *  initialiseBigCube - Initialises the single large cube and passes
         *  its config into the Debug panel.
         */
        function initialiseBigCube() {
            var cubeContainer = $.getElement('div', 'cube-container', {}, {});
            cubeView.appendChild(cubeContainer);
            bigcube = Object.create(Cube);
            bigcube.init(250, 250, 0, 'main', cubeContainer, {
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
         *  @param {container} - A Cube containing HTML Element.
         *  @param {index} - The index of the Cube for sequential animation.
         */
        function animateCubeIn(container, index) {

            var from = -($.windowHeight() * 0.8),
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
                .start();
        }

        /* Let's prevent the horrible over scroll on mobile devices */
        document.addEventListener('touchmove', $.prevent);

    });

});