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
