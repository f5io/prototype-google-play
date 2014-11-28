var $ = require('../utilities');
var Interpol = require('interpol');
var initialValues = { gamma: 0, beta: 0 };
var cachedValues = { gamma: 0, beta: 0 };
var prevValues = { gamma: 0, beta: 0 };

var elem;

function handler(e) {
    console.log('handler');

    prevValues.gamma = cachedValues.gamma;
    prevValues.beta = cachedValues.beta;

    cachedValues.gamma = initialValues.gamma - e.gamma;
    cachedValues.beta = initialValues.beta - e.beta;
}

function render() {

    var dt = 1 / 60;
    var RC = 0.3;
    var alpha = dt / (RC + dt);

    var rX = (alpha * cachedValues.beta) + (1 - alpha) * prevValues.beta;
    var rY = (alpha * cachedValues.gamma) + (1 - alpha) * prevValues.gamma;

    rX *= 0.5;
    rY *= 0.5;

    elem.style[$.CSS_TRANSFORM] = 'rotateX(' + rX.toFixed(3) + 'deg) rotateY(' + rY.toFixed(3) + 'deg)';
}

function getInitialValues(callback) {
    window.addEventListener('deviceorientation', function init(e) {
        initialValues.gamma = e.gamma;
        initialValues.beta = e.beta;
        window.removeEventListener('deviceorientation', init);
        if (callback) callback();
    });
}

function Orient(el) {
    console.log('orient');
    elem = el;
    getInitialValues();
    return Orient;
}

Orient.listen = function() {
    console.log('orient listen');
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
    getInitialValues(fn);
    return Orient;
};


module.exports = Orient;