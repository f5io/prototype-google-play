/*
 *
 * Google Ad Prototype 2014 - Utilities
 * @author: Joe Harlow
 *
 */

var w = window,
	d = document;

/*
 *  _getFirstSupported [private] - Take an array of CSS properties and return a supported string.
 *  @param {arr} - An array of properties to check against.
 *
 *  @return {string} - A vendor specific CSS property string.
 */
function _getFirstSupported(arr) {
    var div = document.createElement('div');
    var ven = null;
    arr.forEach(function(vendor) {
         if (typeof div.style[vendor] !== 'undefined') ven = vendor;
    });

    return ven;
}

/*
 *  prefixProperty [private] - Calculates the vendor specific string for the supplied CSS property.
 *  @param {prop} - The property string
 *
 *  @return {string} - The vendor specific string.
 */
function prefixProperty(prop) {
    var propCap = prop.charAt(0).toUpperCase() + prop.substring(1);
    var arr = ' ms Moz Webkit O'.split(' ').map(function(prefix) {
        return prefix === '' ? prop : prefix + propCap;
    });
    return _getFirstSupported(arr);
}

/*
 *  selector - A simple DOM Element selection function.
 *  @param {sel} - A string CSS selector to query for.
 *  @param {context} (Optional) - A HTML Element context to check within, defaults to document.
 *
 *  @return {array} - An array of matched elements.
 */
function selector(sel, context) {
	return Array.prototype.slice.call((context || d).querySelectorAll(sel));
}

/*
 *  selector.ready - A simple DOM Ready handler.
 *  @param {fn} - A function to be called when the DOM is ready.
 */
selector.ready = function(fn) {
	if (d.readyState === 'complete') return setTimeout(fn, 1);
	w.addEventListener('DOMContentLoaded', fn);
};

/*
 *  selector.extend - Extend objects into each other.
 *  @param {object} - An initial object to extend into.
 *  @params {...arguments} - Objects to extend into the initial object.
 *
 *  @return {object} - The extended object.
 */
selector.extend = function() {
    var args = [].slice.call(arguments),
        ret = args[0];
    for (var i = 1, len = args.length; i < len; i++) {
        var obj = args[i];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) ret[prop] = obj[prop];
        }
    }
    return ret;
};

/*
 *  selector.clone - Clone an object.
 *  @param {obj} - The object to clone.
 *
 *  @return {object} - The cloned object.
 */
selector.clone = function(obj) {
    return selector.extend({}, obj);
};

/*
 *  selector.norm - Normalise rotation.
 *  @param {deg} - The number of degrees to normalise.
 *
 *  @return {number} - The normalised number of degrees.
 */
selector.norm = function(deg) {
    if (deg >= 0) return deg;
    return 360 - Math.abs(deg);
};

/*
 *  selector.deg2rad - Convert degrees to radians.
 *  @param {deg} - The number of degrees to convert.
 *
 *  @return {number} - The number of degrees in radians.
 */
selector.deg2rad = function(deg) {
    return deg * 0.017453292519943295; // (deg / 180) * Math.PI
};

/*
 *  selector.rad2deg - Convert radians to degrees.
 *  @param {rad} - The number of radians to convert.
 *
 *  @return {number} - The number of radians in degrees.
 */
selector.rad2deg = function(rad) {
    return rad * 57.29577951308232; // rad / Math.PI * 180
};

/*
 *  selector.prevent - A simple preventDefault event handler.
 *  @param {e} - The event to be prevented.
 */
selector.prevent = function(e) {
    e.preventDefault();
};

/*
 *  selector.format - A simple string formatter.
 *  @param {str} - The string to format.
 *  @param {obj} - The dictionary to use for string formatting.
 *
 *  @return {string} - The formatted string.
 */
selector.format = function(str, obj) {
    return str.toString().replace(/\{([^}]+)\}/g, function(match, group) {
        return obj[group];
    });
};

/*
 *  selector.range - A random integer generator between `min` and `max`.
 *  @param {min} - The minimum integer.
 *  @param {max} - The maximum integer.
 *
 *  @return {integer} - A random integer in the designated range.
 */
selector.range = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*
 *  selector.floatRange - A random float generator between `min` and `max`.
 *  @param {min} - The minimum float.
 *  @param {max} - The maximum float.
 *
 *  @return {float} - A random float in the designated range.
 */
selector.floatRange = function(min, max) {
    return Math.random() * (max - min) + min;
};

/*
 *  selector.nearest - Round the supplied `val` to the nearest `factor`.
 *  @param {val} - The value to be rounded.
 *  @param {factor} - The factor to be rounded to.
 *
 *  @return {number} - The rounded number.
 */
selector.nearest = function(val, factor) {
	return Math.round(val / factor) * factor;
};

/*
 *  selector.isEven - Check whether the supplied number is even.
 *  @param {num} - The value to be checked.
 *
 *  @return {boolean} - Whether the value is even or not.
 */
selector.isEven = function(num) {
    return num % 2 === 0;
};

/*
 *  selector.isOdd - Check whether the supplied number is odd.
 *  @param {num} - The value to be checked.
 *
 *  @return {boolean} - Whether the value is odd or not.
 */
selector.isOdd = function(num) {
    return num % 2 !== 0;
};

/*
 *  selector.isDefined - Check whether the supplied value is defined.
 *  @param {*} - The value to be checked.
 *
 *  @return {boolean} - Whether the value is defined or not.
 */
selector.isDefined = function(val) {
    return val !== void 0;
};

/*
 *  selector.getElement - Return a new HTML element with the defined parameters.
 *  @param {tag} - A string of the HTML tag name to be created.
 *  @param {className} - A string of the className for the element.
 *  @param {attrs} - A hash map of attributes to be applied to the element.
 *  @param {style} - A hash map of styles to be applied to the element.
 *
 *  @return {HTMLElement} - The created HTMLElement.
 */
selector.getElement = function(tag, className, attrs, style) {
    var el = d.createElement(tag);
    el.className = className;
    Object.keys(attrs).forEach(function(key) {
        el.setAttribute(key, attrs[key]);
    });
    Object.keys(style).forEach(function(key) {
        el.style[key] = style[key];
    });
    return el;
};

/*
 *  selector.getRandomRotation - Return a random rotation from the supplied `opts` or defaults.
 *  @param {opts} (Optional) - An array of options to pic from.
 *
 *  @return {HTMLElement} - A random rotation from the `opts` or defaults.
 */
selector.getRandomRotation = function(opts) {
    opts = opts || [0, 90, 180, 270];
    return opts[selector.range(0, opts.length - 1)];
};

/*
 *  selector.emitter - An IIFE for a small PubSub/EventEmitter lib.
 *
 *  @return {object} - The event emitter lib.
 */
selector.emitter = (function() {
    var _listeners = {};

    /*
     *  emitter.on - Subscribe to an event with the designated callback and function scope.
     *  @param {ev} - The event name to subscribe to.
     *  @param {fn} - The callback function to use.
     *  @param {scope} (Optional) - The scope to bind to the callback function.
     *
     *  @return {function} - A decoupling event to unbind the event subscription.
     */
    function on() {
        var args = [].slice.call(arguments);
        var ev = args[0],
            fn = args[1],
            scope = args[2] || selector;
     
        _listeners[ev] = _listeners[ev] || [];
        _listeners[ev].push({ fn : fn, scope : scope });

        var idx = _listeners[ev].length - 1;
        return function decouple() {
            _listeners[ev].splice(idx, 1);
        };
    }

    /*
     *  emitter.emit - Publish an event to the designated event name
     *  @param {ev} - The event name to publish.
     *  @param {...arguments} (Optional) - The paramters to be passed into the events subscribed callbacks.
     */
    function emit() {
        var args = [].slice.call(arguments);
        var ev = args[0],
            props = args.slice(1);
     
        if (!(ev in _listeners)) return;

        _listeners[ev].forEach(function(listener) {
            listener.fn.apply(listener.scope, props);
        });
    }
     
    return {
        on: on,
        emit: emit
    };
})();

/*
 *  selector.windowWidth - An IIFE for a small cross-browser window width implementation.
 *
 *  @return {function} - When called will report the width of the window.
 */
selector.windowWidth = (function() {
    if (typeof w.innerWidth !== 'undefined') {
        return function() {
            return w.innerWidth;
        };
    } else {
        var b = ('clientWidth' in d.documentElement) ? d.documentElement : d.body;
        return function() {
            return b.clientWidth;
        };
    }
})();

/*
 *  selector.windowHeight - An IIFE for a small cross-browser window height implementation.
 *
 *  @return {function} - When called will report the height of the window.
 */
selector.windowHeight = (function() {
    if (typeof w.innerHeight !== 'undefined') {
        return function() {
            return w.innerHeight;
        };
    } else {
        var b = ('clientHeight' in d.documentElement) ? d.documentElement : d.body;
        return function() {
            return b.clientHeight;
        };
    }
})();

/*
 *  selector.CSS_TRANSFORM - The vendor specific string for CSS transforms.
 */
selector.CSS_TRANSFORM = prefixProperty('transform');

/*
 *  selector.CSS_TRANSFORM_ORIGIN - The vendor specific string for CSS transform origin.
 */
selector.CSS_TRANSFORM_ORIGIN = prefixProperty('transformOrigin');

/*
 *  selector.CSS_PERSPECTIVE - The vendor specific string for CSS perspective.
 */
selector.CSS_PERSPECTIVE = prefixProperty('perspective');

/*
 *  selector.computeVertexData - Take an element and return the A, B, C and D vertices.
 *  @param {elem} - An HTML element to have its vertices calculated.
 *
 *  @return {object} - An object of vertex data for the supplied element.
 */
selector.computeVertexData = function(elem) {
    var w = elem.offsetWidth,
        h = elem.offsetHeight,
        v = {
            a: { x: -w / 2, y: -h / 2, z: 0 },
            b: { x:  w / 2, y: -h / 2, z: 0 },
            c: { x:  w / 2, y:  h / 2, z: 0 },
            d: { x: -w / 2, y:  h / 2, z: 0 }
        },
        transform;

    while (elem.nodeType === 1) {
        transform = selector.getTransform(elem);
        v.a = addVectors(rotateVector(v.a, transform.rotate), transform.translate);
        v.b = addVectors(rotateVector(v.b, transform.rotate), transform.translate);
        v.c = addVectors(rotateVector(v.c, transform.rotate), transform.translate);
        v.d = addVectors(rotateVector(v.d, transform.rotate), transform.translate);
        elem = elem.parentNode;
    }
    return v;
};

/*
 *  selector.getTransform - Take an element and return the transformation data.
 *  @param {elem} - An HTML element to have its transformation calculated.
 *
 *  @return {object} - An object of transformation data for the supplied element.
 */
selector.getTransform = function(elem) {
    var val = getComputedStyle(elem, null)[selector.CSS_TRANSFORM],
        matrix = parseMatrix(val),
        rotateY = Math.asin(-matrix.m13),
        rotateX, rotateZ;

        rotateX = Math.atan2(matrix.m23, matrix.m33);
        rotateZ = Math.atan2(matrix.m12, matrix.m11);

    return {
        transformStyle: val,
        matrix: matrix,
        rotate: {
            x: rotateX,
            y: rotateY,
            z: rotateZ
        },
        translate: {
            x: matrix.m41,
            y: matrix.m42,
            z: matrix.m43
        }
    };
};


/*
 *  parseMatrix [private] - Take an string and return a 4x4 Matrix definition.
 *  @param {string} - The string to be parsed.
 *
 *  @return {object} - A 4x4 Matrix definition.
 */
function parseMatrix (matrixString) {
    var c = matrixString.split(/\s*[(),]\s*/).slice(1,-1),
        matrix;

    if (c.length === 6) {
        // 'matrix()' (3x2)
        matrix = {
            m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
            m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
            m13: 0,     m23: 0,     m33: 1, m43: 0,
            m14: 0,     m24: 0,     m34: 0, m44: 1
        };
    } else if (c.length === 16) {
        // matrix3d() (4x4)
        matrix = {
            m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
            m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
            m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
            m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
        };

    } else {
        // handle 'none' or invalid values.
        matrix = {
            m11: 1, m21: 0, m31: 0, m41: 0,
            m12: 0, m22: 1, m32: 0, m42: 0,
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    }
    return matrix;
}

/*
 *  addVectors [private] - Add to vectors together.
 *  @param {v1} - A Vector3 object.
 *  @param {v2} - A Vector3 object.
 *
 *  @return {object} - A calculated Vector3 object.
 */
function addVectors (v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}


/*
 *  rotateVectors [private] - Rotate `v1` around `v2`.
 *  @param {v1} - A Vector3 object.
 *  @param {v2} - A Vector3 object.
 *
 *  @return {object} - A calculated Vector3 object.
 */
function rotateVector (v1, v2) {
    var x1 = v1.x,
        y1 = v1.y,
        z1 = v1.z,
        angleX = v2.x / 2,
        angleY = v2.y / 2,
        angleZ = v2.z / 2,

        cr = Math.cos(angleX),
        cp = Math.cos(angleY),
        cy = Math.cos(angleZ),
        sr = Math.sin(angleX),
        sp = Math.sin(angleY),
        sy = Math.sin(angleZ),

        w = cr * cp * cy + -sr * sp * -sy,
        x = sr * cp * cy - (-cr) * sp * -sy,
        y = cr * sp * cy + sr * cp * sy,
        z = cr * cp * sy - (-sr) * sp * -cy,

        m0 = 1 - 2 * ( y * y + z * z ),
        m1 = 2 * (x * y + z * w),
        m2 = 2 * (x * z - y * w),

        m4 = 2 * ( x * y - z * w ),
        m5 = 1 - 2 * ( x * x + z * z ),
        m6 = 2 * (z * y + x * w ),

        m8 = 2 * ( x * z + y * w ),
        m9 = 2 * ( y * z - x * w ),
        m10 = 1 - 2 * ( x * x + y * y );

    return {
        x: x1 * m0 + y1 * m4 + z1 * m8,
        y: x1 * m1 + y1 * m5 + z1 * m9,
        z: x1 * m2 + y1 * m6 + z1 * m10
    };
}


/*
 *  Define some Custom Events which we can use anywhere in the project.
 *  `tap`/`fastclick` - Removes the 300ms click delay for mobile.
 *  `swipeleft`/`swiperight` - Detects a swipe on the X-axis.
 *  `swipeup`/`swipedown` - Detects a swipe on the Y-axis.
 */
(function() {

    if (!d.addEventListener) return;
    
    var createEvent = function(el, name) {
        var e = d.createEvent('CustomEvent');
        e.initCustomEvent(name, true, true, el.target);
        if (!el.target.dispatchEvent(e)) e.preventDefault();
        e = null;
        return false;
    };

    var notMoved = true,
        startPos = { x: 0, y: 0 },
        endPos = { x: 0, y: 0},
        prevTarget, prevTime,
        evs = {
            touchstart: function(e) {
                startPos.x = e.touches[0].pageX;
                startPos.y = e.touches[0].pageY;
            },
            touchmove: function(e) {
                notMoved = false;
                endPos.x = e.touches[0].pageX;
                endPos.y = e.touches[0].pageY;
            },
            touchend: function(e) {
                if (notMoved) {
                    createEvent(e, 'fastclick');
                    createEvent(e, 'tap');
                    if (e.target === prevTarget) {
                        var delta = Date.now() - prevTime;
                        if (delta < 500) {
                            createEvent(e, 'doubletap');
                        }
                    }
                    prevTarget = e.target;
                    prevTime = Date.now();
                } else {
                    var x = endPos.x - startPos.x,
                        xr = Math.abs(x),
                        y = endPos.y - startPos.y,
                        yr = Math.abs(y);

                    if (Math.max(xr, yr) > 20) {
                        createEvent(e, xr > yr ? (x < 0 ? 'swipeleft' : 'swiperight') : (y < 0 ? 'swipeup' : 'swipedown'));
                        notMoved = true;
                    }
                }
            },
            touchcancel: function(e) {
                notMoved = false;
            }
        };

    for (var e in evs) {
        d.addEventListener(e, evs[e]);
    }

})();

module.exports = selector;