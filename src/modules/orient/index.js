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