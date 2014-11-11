var $ = require('../utilites');
var Side = require('./side');
var matrix = require('./matrix');

function Cube(width, height, target) {
	
	this.width = width || 250;
	this.height = height || 250;
	this.sides = [];
	this.element = $.getElement('div', 'cube', {}, {
		width: this.width + 'px',
		height: this.height + 'px'
	});
	this.rotation = {
		X: 0,
		Y: 0,
		Z: 0
	};

	var offset = this.width / 2;

	for (var i = 0; i < 6; i++) {
		var side = new Side(this.width, this.height, i);
		this.sides.push(side);
		this.element.appendChild(side.element);

		side.rotation.Y = i === 1 ? 180 : i === 2 ? 90 : i === 3 ? -90 : 0;
		side.rotation.X = i === 4 ? 90 : i === 5 ? -90 : 0;

		side.render();
	}

	target = target || $('[role="main"]')[0];

	target.appendChild(this.element);
	target.style[$.CSS_TRANSFORM] = 'translateZ(-' + offset + 'px)';

}

Cube.prototype.render = function() {
	this.element.style[$.CSS_TRANSFORM] =	'rotateX(' + this.rotation.X + 'deg) ' +
											'rotateY(' + this.rotation.Y + 'deg) ' +
											'rotateZ(' + this.rotation.Z + 'deg) translateZ(0)';
};

Cube.prototype.normalizeOppositeSide = function(side, direction) {
	if (direction !== 'updown') return;

	var sIndex = parseInt(side.getAttribute('side'), 10) - 1;
	var oIndex = $.isEven(sIndex) ? sIndex + 1 : sIndex - 1;
	var oSide = this.sides[oIndex];

	oSide.rotation.Z = oSide.rZ + 180;
	oSide.render();

};

Cube.prototype.normalizeFace = function() {
	var r = this.rotation;

	var nX = Math.abs($.nearest(r.X, 90) % 360),
		nY = Math.abs($.nearest(r.Y, 90) % 360),
		nZ = Math.abs($.nearest(r.Z, 90) % 360);

	for (var i = this.sides.length - 1; i >= 0; i--) {
		var s = this.sides[i];
		s.rotation.Z = matrix[i][nX][nY][nZ];
		s.render();
	}

	// this.sides.forEach(function(s, i) {
	// 	s.rotation.Z = matrix[i][nX][nY][nZ];
	// 	s.render();
	// });

};

Cube.prototype.getSideFromTarget = function(target) {
	var el = target;
	while (!/side/.test(el.className)) {
		el = el.parentNode;
	}
	return el;
};

Cube.prototype.remove = function() {
	this.element.parentNode.removeChild(this.element);
};

module.exports = Cube;