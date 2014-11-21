/*
 *
 * Google Ad Prototype 2014
 * @author: Joe Harlow
 *
 */

/* General Utilites */
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

        /* All assets are preloaded */
        var cubes = {},
            bigcube, bigrot,
            cubeView = $('[role="cube"]')[0];

        /* Initialise the Debug Panel */
        Debug.init();

        /* Create and initialise the Background Animation */
        var bg = Object.create(Background);
        bg.init($('[role="background"]')[0]);

        /* Setup Accelerometer orientation listeners */
        // Orient($('[role="main"]')[0]).listen();

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
             * current rotation of the first cube and turn of `useGamification` in the config.
             */
            if (sameRot && (sameFaceRot || isNormalised)) {
                bigrot = $.clone(cbs[0].rotation);
                Config.global.useGamification = false;
            }

        });

        /*
         *  initialiseFourCubes - Initialises the gamified ad with 4 cubes
         *  and passes their configs into the Debug panel.
         */
        function initialiseFourCubes() {
            var configs = [];
            for (var i = 0; i < 4; i++) {
                var cube = Object.create(Cube);
                cube.init(125, 125, i, 'cube0' + (i + 1), cubeView);
                cubes[cube.id] = cube;
                cube.element.style.left = $.isOdd(i + 1) ? '-125px' : '125px';
                cube.element.style.top = i < 2 ? '-125px' : '125px';
                if (Config.global.useGamification) {
                    cube.rotation.X = $.getRandomRotation([0, 180]);
                    cube.rotation.Y = $.getRandomRotation([90, 270]);
                    cube.rotation.Z = $.getRandomRotation();
                    cube.render();
                }
                configs.push(cube);
            }

            Debug.defineCubeProperties(configs);
        }

        /*
         *  initialiseBigCube - Initialises the single large cube and passes
         *  its config into the Debug panel.
         */
        function initialiseBigCube() {
            bigcube = Object.create(Cube);
            bigcube.init(250, 250, 0, 'main', cubeView, {
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

        /* Let's prevent the horrible over scroll on mobile devices */
        document.addEventListener('touchmove', $.prevent);

    });

});