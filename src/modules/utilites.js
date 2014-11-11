var w = window,
	d = document;

function _getFirstSupported(arr) {
    var div = document.createElement('div');
    var ven = null;
    arr.forEach(function(vendor) {
         if (typeof div.style[vendor] !== 'undefined') ven = vendor;
    });

    return ven;
}

function selector(sel, context) {
	return Array.prototype.slice.call((context || d).querySelectorAll(sel));
}

selector.ready = function(fn) {
	if (d.readyState === 'complete') return setTimeout(fn, 1);
	w.addEventListener('DOMContentLoaded', fn);
};

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

selector.prevent = function(e) {
    e.preventDefault();
};

selector.format = function(str, obj) {
    return str.toString().replace(/\{([^}]+)\}/g, function(match, group) {
        return obj[group];
    });
};

selector.nearest = function(val, factor) {
	return Math.round(val / factor) * factor;
};

selector.isEven = function(num) {
    return num % 2 === 0;
};

selector.isOdd = function(num) {
    return num % 2 !== 0;
};

selector.isDefined = function(val) {
    return typeof val !== 'undefined';
};

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

selector.CSS_TRANSFORM = (function() {
    var arr = ' ms Moz Webkit O'.split(' ').map(function(prefix) {
        return prefix === '' ? 'transform' : prefix + 'Transform';
    });
    return _getFirstSupported(arr);
})();

module.exports = selector;