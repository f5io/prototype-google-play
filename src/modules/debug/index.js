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
    closeBtn.addEventListener('click', function() {
        target.classList.add('hidden');
        document.addEventListener('touchmove', $.prevent);
    });

    var openBtn = document.createElement('div');
    openBtn.className = 'open';
    openBtn.innerHTML = '<span></span>';
    openBtn.addEventListener('click', function() {
        target.classList.remove('hidden');
        document.removeEventListener('touchmove', $.prevent);
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
            configs.forEach(function(config) {
                if ((key === 'useVideo' || key === 'useGif') && e.target.checked)  {
                    config['useContent'] = true;
                    $('input#useContent', cubeUl)[0].checked = true;
                }

                if (key === 'useContent' && !e.target.checked) {
                    config['useVideo'] = config['useGif'] = false;
                    $('input#useVideo', cubeUl)[0].checked = false;
                    $('input#useGif', cubeUl)[0].checked = false;
                }

                config[key] = e.target.checked;
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