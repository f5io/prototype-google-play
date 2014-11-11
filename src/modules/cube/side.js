var $ = require('../utilites');
var content = require('./content');
var Config = require('../config');

function populateElement(elem) {
	// temp
	var c = content.sides[this.index];
	
	if (Config.useBackgrounds) {
		var img = new Image();
		img.src = $.format(content.background, { i: this.index + 1 });
		img.width = this.width;
		img.height = this.height;

		elem.appendChild(img);
	}

	if (Config.useContent) {
		var span = document.createElement('span');
		span.innerHTML = c.html();

		elem.appendChild(span);

		c.onload(elem);
	}

	

	return elem;
}

function Side(width, height, index) {
	this.width = width;
	this.height = height;
	this.offset = this.width / 2;
	this.index = index;
	this.element =	populateElement.call(this,
						$.getElement(
							'div',
							'side no' + (this.index + 1),
							{
								side : (this.index + 1)
							},
							{
								width : this.width + 'px',
								height: this.height + 'px'
							}
						)
					);
	this.rotation = {
		X: 0,
		Y: 0,
		Z: 0
	};
	this.rZ = this.rotation.Z;
}

Side.prototype.render = function() {
	this.rZ = this.rotation.Z;
	this.element.style[$.CSS_TRANSFORM] = 'rotateX(' + this.rotation.X + 'deg) rotateY(' + this.rotation.Y + 'deg) rotateZ(' + this.rotation.Z + 'deg) translateZ(' + this.offset + 'px)';
};

module.exports = Side;