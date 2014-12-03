/*
 *
 * Google Ad Prototype 2014 - Shadow Class
 * @author: Joe Harlow
 *
 */

/* General Utilities */
var $ = require('../utilities');

/* Import modules */
var Common = require('./common');
var Config = require('../config');

/* Inherit from the Cube Component Base Class */
var Shadow = Object.create(Common);

/*
 *  Shadow.init - Override `init` on the Base Class.
 *  @param {width} - A number for the width of the component.
 *  @param {height} - A number for the height of the component.
 *  @param {index} - A number for the index of the component.
 *  @param {name} - A string to of the name of the component.
 *  @param {target} - An HTML Element where the component will be appended.
 *  @param {parent} - The Shadow's parent `Cube`.
 */
Shadow.init = function(width, height, index, name, target, parent) {
    this.parent = parent;
    this.scale = { X : 1, Y : 1 };
    this.opacity = 0.1;

    /* `super` the Base Class */
    Common.init.apply(this, arguments);

    this.rotation.X = 90;
    this.translate.Z = -(this.height * 0.8);

    this.hypotenuse = Math.sqrt((this.width * this.width) + (this.height * this.height));
    this.hypRatio = (this.hypotenuse / this.width) - 1;
};

/*
 *  Shadow.getElement - Override `getElement` on the Base Class.
 *
 *  @return {HTMLElement} - A HTML Element.
 */
Shadow.getElement = function() {
	var ratio = 1.5;
	var borderRadius = '25px';

    return $.getElement('div', 'cube-shadow', {}, {
		width : this.width / ratio + 'px',
		height : this.height / ratio + 'px',
		borderRadius : borderRadius
	});
};

/*
 *  Shadow.render - Override `render` on the Base Class.
 */
Shadow.render = function() {
    /* `super` the Base Class */
    Common.render.apply(this);

    /* Append scale to the end of the transform string */
    this.element.style[$.CSS_TRANSFORM] += ' scale(' + this.scale.X + ',' + this.scale.Y + ')';
    this.element.style.opacity = this.opacity;
};

module.exports = Shadow;