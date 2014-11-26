/*
 *
 * Google Ad Prototype 2014 - Cube Component Base Class
 * @author: Joe Harlow
 *
 */

/* General Utilites */
var $ = require('../utilities');

/* Define the common component functions which will be `super`ed by the component classes */
var Common = {
    /*
     *  init - Initialise the component.
     *  @param {width} - A number for the width of the component.
     *  @param {height} - A number for the height of the component.
     *  @param {index} - A number for the index of the component.
     *  @param {name} - A string to of the name of the component.
     *  @param {target} - An HTML Element where the component will be appended.
     */
    init: function(width, height, index, name, target) {
        this.id = Math.random().toString(36).substr(5, 10);
        this.width = width;
        this.height = height;
        this.index = index;
        this.name = name;
        this.target = target;
        this.rotation = {
            X: 0, Y: 0, Z: 0
        };
        this.translate = {
            X: 0, Y: 0, Z: 0
        };
        this.element = this.getElement();
        this.target.appendChild(this.element);
    },
    /*
     *  getElement - A function to get the component element, to be overridden.
     *
     *  @return {HTMLElement} - A HTML Element.
     */
    getElement: function() {
        return $.getElement('div', 'common', {}, {});
    },
    /*
     *  render - Render the components `element` with CSS transformation.
     */
    render: function() {
        this.element.style[$.CSS_TRANSFORM] = 'rotateX(' + this.rotation.X + 'deg) ' +
            'rotateY(' + this.rotation.Y + 'deg) ' +
            'rotateZ(' + this.rotation.Z + 'deg) ' +
            'translateX(' + this.translate.X + 'px) ' +
            'translateY(' + this.translate.Y + 'px) ' +
            'translateZ(' + this.translate.Z + 'px)';
    },
    /*
     *  remove - Remove the components `element` from it's `target`.
     */
    remove: function() {
        this.element.parentNode.removeChild(this.element);
    }
};

module.exports = Common;