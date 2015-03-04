/*
 *
 * Google Ad Prototype 2014 - Face Class
 * @author: Joe Harlow
 *
 */

/* General Utilities */
var $ = require('../utilities');

/* Import modules */
var Common = require('./common');
var content = require('./content');
var Config = require('../config');
var AssetManager = require('../assetmanager');

/* Inherit from the Cube Component Base Class */
var Face = Object.create(Common);

/*
 *  Face.init - Override `init` on the Base Class.
 *  @param {width} - A number for the width of the component.
 *  @param {height} - A number for the height of the component.
 *  @param {index} - A number for the index of the component.
 *  @param {name} - A string to of the name of the component.
 *  @param {target} - An HTML Element where the component will be appended.
 *  @param {parent} - The Face's parent `Cube`.
 */
Face.init = function(width, height, index, name, target, parent) {
    this.parent = parent;
    this.parentID = parent.id;

    /* `super` the Base Class */
    Common.init.apply(this, arguments);

    this.element.setAttribute('parent', this.parentID);
    this.translate.Z = this.width / 2;
    this.renderedZ = this.rotation.Z;
};

/*
 *  Face.getElement - Override `getElement` on the Base Class.
 *
 *  @return {HTMLElement} - A HTML Element.
 */
Face.getElement = function() {
    return this.populateElement(
        $.getElement(
            'div',
            'side no' + (this.index + 1),
            {
                index : this.index
            },
            {
                width : this.width + 'px',
                height: this.height + 'px'
            }
        )
    );
};

/*
 *  Face.populateElement - Populate a Face element with content.
 *  @param {elem} - An HTML Element to be populated.
 *
 *  @return {HTMLElement} - The populated HTML Element.
 */
Face.populateElement = function(elem) {
    var lang = Config.global.language;

    if (this.parent.config.useBackgrounds) {
        var img = new Image();
        var name = this.parent.config.cropLargeFaces ? 'main' : this.name;
        var str = Config.global.isCeltra ? Config.BASE_URL + content.background : content.background;
        var url = $.format(str, { i: this.index + 1, name: name, language: lang });
        img.src = AssetManager.get(url).uri();
        img.width = this.width;
        img.height = this.height;
        
        if (this.parent.config.cropLargeFaces) {
            img.width *= 2;
            img.height *= 2;
            img.style.left = $.isOdd(this.parent.index) ? -this.width + 'px' : 0;
            img.style.top = this.parent.index < 2 ? 0 : -this.height + 'px';
        }

        elem.appendChild(img);
    }

    if (this.parent.config.useContent && this.index !== 0) {
        // var c = content.sides[this.name][this.index];
        var span = document.createElement('span');
        span.className = 'content';

        var html = content.html(this.parent.config);
        var section = content[this.parent.name];
        var id = section[lang][this.index];
        var link = $.format(section._base, { id: id });

        span.innerHTML = $.format(html, { link: link });

        elem.appendChild(span);

        content.onload(elem, this.parent.config);
    }

    var shadow = document.createElement('div');
    shadow.className = 'shadow';
    shadow.style.width = this.width + 'px';
    shadow.style.height = this.height + 'px';

    elem.appendChild(shadow);

    return elem;
};

/*
 *  Face.changeContent - Populate a Face element with content from a specific `index` in the content matrix.
 *  @param {index} - An HTML Element to be populated.
 *
 *  @return {integer} - The index transformed accordingly for Matrix length.
 */
Face.changeContent = function(index) {
    var lang = Config.global.language;

    if (this.parent.config.useBackgrounds) {
        var img = $('img', this.element)[0];
        var str = Config.global.isCeltra ? Config.BASE_URL + content.background : content.background; 
        var url = $.format(str, { i: index + 1, name: this.name, language: lang });
        img.src = AssetManager.get(url).uri();
    }

    if (this.parent.config.useContent) {
        index = index >= content.sides[this.name].length ? 0 : index;
        var c = content.sides[this.name][index];
        var span = $('.content', this.element)[0];
        span.innerHTML = c.html(this.parent.config);

        c.onload(this.element, this.parent.config);
    }

    return index;
};

/*
 *  Face.render - Override `render` on the Base Class.
 */
Face.render = function() {
    this.renderedZ = this.rotation.Z;

    /* `super` the Base Class */
    Common.render.apply(this);
};

module.exports = Face;

