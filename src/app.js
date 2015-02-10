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
    var CUBE_WIDTH = Math.min(500, Math.round($.windowWidth() * 0.8)), /*250,*/
        HALF_CUBE_WIDTH = CUBE_WIDTH / 2,
        CONTAINER_PERSPECTIVE = (2 * CUBE_WIDTH) + 50,
        DIRECTION_LEFT = 'left',
        DIRECTION_RIGHT = 'right';

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
    AssetManager.add([
        pre + 'assets/img/play-logo-lockup.jpg',
        pre + 'assets/sound/click.mp3',
        pre + 'assets/img/cubes/apps/side1.jpg',
        pre + 'assets/img/cubes/apps/side2.jpg',
        pre + 'assets/img/cubes/apps/side3.jpg',
        pre + 'assets/img/cubes/apps/side4.jpg',
        pre + 'assets/img/cubes/apps/side5.jpg',
        pre + 'assets/img/cubes/apps/side6.jpg',
        pre + 'assets/img/cubes/books/side1.jpg',
        pre + 'assets/img/cubes/books/side2.jpg',
        pre + 'assets/img/cubes/books/side3.jpg',
        pre + 'assets/img/cubes/books/side4.jpg',
        pre + 'assets/img/cubes/books/side5.jpg',
        pre + 'assets/img/cubes/books/side6.jpg',
        pre + 'assets/img/cubes/movies/side1.jpg',
        pre + 'assets/img/cubes/movies/side2.jpg',
        pre + 'assets/img/cubes/movies/side3.jpg',
        pre + 'assets/img/cubes/movies/side4.jpg',
        pre + 'assets/img/cubes/movies/side5.jpg',
        pre + 'assets/img/cubes/movies/side6.jpg',
        pre + 'assets/img/cubes/music/side1.jpg',
        pre + 'assets/img/cubes/music/side2.jpg',
        pre + 'assets/img/cubes/music/side3.jpg',
        pre + 'assets/img/cubes/music/side4.jpg',
        pre + 'assets/img/cubes/music/side5.jpg',
        pre + 'assets/img/cubes/music/side6.jpg'
    ]).preload().then(function() {

        // loadView.className = 'off';

        /* All assets are preloaded */
        var cubes = {}, shadow,
            currentCube, currentIndex = 0;
            
        /* Initialise the Debug Panel */
        // Debug.init();

        /* When the debug panel is open prevent pointer events on the main view */
        $.emitter.on('debug_panel', function(isOpen) {
            mainView.classList[isOpen ? 'add' : 'remove']('covered');
        });

        var cubeNames = ['music', 'books', 'apps', 'movies'],
            menuItems = [];

        currentCube = createCube(cubeNames[currentIndex]);

        cubeNames.forEach(function(name, i) {
            var el = menuView.querySelector('.' + name);
            menuItems.push(el);

            el.addEventListener('tap', function(e) {
                if (el.classList.contains('selected')) return;
                menuItems.forEach(function(el) {
                    el.classList.remove('selected');
                });
                document.body.className = menuView.className = 'border-' + name;
                el.classList.add('selected');
                var direction = i < currentIndex ? DIRECTION_LEFT : DIRECTION_RIGHT;
                currentIndex = i;
                createCube(name, direction);
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

            animateCubeIn(cube, direction);
            Debug.defineCubeProperties([cube]);
            return cube;
        }

        /*
         *  clearCube - Clears the cube view and emptys the cube hash map.
         */
        function clearCube() {
            cubeView.innerHTML = '';
            cubes = {};
        }

        function animateCubeIn(cube, direction) {
            var fn = function() {};
            if (currentCube) {
                animateCubeOut(cube, direction);
                cube.addInteractionListener();
            } else {
                fn = previewRotate;
            }

            var container = cube.target,
                shadow = cube.shadow;

            var fromX = direction === DIRECTION_LEFT ? -$.windowWidth() * 1.2 : $.windowWidth() * 1.2,
                toX = 0;

            container.style[$.CSS_TRANSFORM] += ' translateX(' + fromX + 'px)';
            shadow.translate.X = fromX;
            shadow.render();

            Interpol.tween()
                .from(fromX)
                .to(toX)
                .ease(Interpol.easing.easeOutCirc)
                .step(function(val) {
                    container.style[$.CSS_TRANSFORM] = container.style[$.CSS_TRANSFORM].replace(/translateX\(.+\)/g, function() {
                        return 'translateX(' + val + 'px)';
                    });
                    shadow.translate.X = val * 1.1;
                    shadow.render();
                })
                .complete(function() {
                    fn(cube);
                })
                .start();
        }

        function animateCubeOut(cube, direction) {
            direction = direction === DIRECTION_LEFT ? DIRECTION_RIGHT : DIRECTION_LEFT;

            var oldCube = currentCube;
            currentCube = cube;

            var container = oldCube.target,
                shadow = oldCube.shadow;

            var fromX = 0,
                toX = direction === DIRECTION_LEFT ? -$.windowWidth() * 1.2 : $.windowWidth() * 1.2;

            Interpol.tween()
                .from(fromX)
                .to(toX)
                .ease(Interpol.easing.easeOutCirc)
                .step(function(val) {
                    container.style[$.CSS_TRANSFORM] = container.style[$.CSS_TRANSFORM].replace(/translateX\(.+\)/g, function() {
                        return 'translateX(' + val + 'px)';
                    });
                    shadow.translate.X = val * 1.1;
                    shadow.render();
                })
                .complete(function() {
                    container.parentNode.removeChild(shadow.element);
                    container.parentNode.removeChild(container);
                    oldCube = null;
                })
                .start();
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
                            loadView.className = 'off';
                            arrowView.className = '';
                            var $decouple = $.emitter.on('first_cube_interaction', function() {
                                arrowView.className = 'off';
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
