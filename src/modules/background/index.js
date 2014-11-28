var $ = require('../utilities');
var Interpol = require('interpol');
var Config = require('../config');

var AssetManager = require('../assetmanager');

var Particle = {
    x: 0, y: 0,
    sx: 0, sy: 0,
    vx: 0, vy: 0,
    radius: 10, color: '#ffffff'
};

Particle.init = function(x, y, vx, vy, radius, color) {
    this.x = x || this.x;
    this.y = y || this.y;
    this.sx = x || this.x;
    this.sy = y || this.y;
    this.vx = vx || this.vx;
    this.vy = vy || this.vy;
    this.radius = radius || this.radius;
    this.color = color || this.color;
};

Particle.update = function(width, height, vx, vy) {
    this.x += this.vx + (vx || 0);
    this.y += this.vy + (vy || 0);
    if (this.x < -(this.radius) || (this.x - this.radius) > width || this.y < -(this.radius) || (this.y - this.radius) > height) {
        this.x = this.sx;
        this.y = this.sy;
    }
};

var ParticleSystem = {
    particles: []
};

ParticleSystem.init = function(numOfParticles, startX, startY) {
    this.particles = [];

    for (var i = 0; i < numOfParticles; i++) {
        var particle = Object.create(Particle);
        particle.init(
            startX,
            startY,
            $.floatRange(-1, 1),
            $.floatRange(-1, 1),
            $.floatRange(15, 30),
            'rgba(' + $.range(0, 255) + ',' + $.range(0, 255) + ',' + $.range(0, 255) + ',' + $.floatRange(0.1, 0.7) + ')'
        );
        this.particles.push(particle);
    }

};


var Background = {
    target: undefined,
    canvas: undefined,
    context: undefined,
    system: undefined
};

Background.init = function(target) {
    var _self = this;
    _self.target = target;

    _self.canvas = document.createElement('canvas');

    var setDimensions = (function sD() {
        _self.canvas.width = $.windowWidth();
        _self.canvas.height = $.windowHeight();
        return sD;
    })();

    _self.system = Object.create(ParticleSystem);
    _self.system.init(250, _self.canvas.width / 2, _self.canvas.height / 2);

    window.addEventListener('resize', setDimensions);

    _self.target.appendChild(_self.canvas);
    _self.context = _self.canvas.getContext('2d');

    if (Config.global.useBackgroundAnimation) Interpol.pipeline.add('background', _self.render.bind(_self));

    $.emitter.on('global_config_change', function(key, value) {
        if (key === 'useBackgroundAnimation') {
            if (value && !Interpol.pipeline.has('background')) {
                Interpol.pipeline.add('background', _self.render.bind(_self));
            } else if (Interpol.pipeline.has('background')) {
                Interpol.pipeline.remove('background');
                _self.context.clearRect(0, 0, _self.canvas.width, _self.canvas.height);
            }
        }
    });
};

Background.render = function() {
    // console.log(this.context);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var img = new Image();
    img.src = AssetManager.get('assets/img/playlogo-sml.png').uri();

    for (var i = 0; i < this.system.particles.length; i++) {
        var particle = this.system.particles[i];
        particle.update(this.canvas.width, this.canvas.height);
        //particle.update(this.canvas.width, this.canvas.height, $.floatRange(-1, 1), $.floatRange(-1, 0));

        this.context.drawImage(img, particle.x, particle.y, particle.radius, particle.radius);

        // this.context.beginPath();
        // this.context.fillStyle = particle.color;
        // this.context.arc(particle.x,particle.y,particle.radius,0,Math.PI*2,true);
        // this.context.fill();
    }
};

Background.remove = function() {
    this.target.removeChild(this.canvas);
    Interpol.pipeline.remove('background');
};

module.exports = Background;