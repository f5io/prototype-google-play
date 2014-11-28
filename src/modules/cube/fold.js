var $ = require('../utilities');
var Config = require('../config');
var Vect3 = require('./vect3');
var AssetManager = require('../assetmanager');


var Interpol = require('interpol');


var Fold = {
    init: function(cube, faceIndex) {
        this.width = cube.width;
        this.height = cube.height;
        this.target = cube.target;
        this.faceIndex = faceIndex;
        this.cubeIndex = cube.index;
        this.cubeRotation = cube.rotation;
        this.folds = [];

        var styles = {
            width: this.width * 2 + 'px',
            height: this.height * 2 + 'px'
        };

        styles[$.CSS_TRANSFORM] = 'translateZ(' + Math.ceil(this.width / 2) + 'px)';

        /* Select the `light` from DOM */
        this.light = $('[role="light"]')[0];
        
        /* The light never moves so define the `lightTransform` on `init` */
        this.lightTransform = $.getTransform(this.light);

        this.element = $.getElement('div', 'fold-container', {}, styles);
        this.target.appendChild(this.element);
        populateElement.call(this);

        function populateElement() {
            for (var i = 0; i < 4; i++) {
                var styles = {
                    left: $.isEven(i) ? 0 : this.width + 'px',
                    top: i > 1 ? this.height + 'px' : 0,
                    width: this.width + 'px',
                    height: this.height + 'px'
                };

                var transformOrigin = i === 0 ? '50% 100%' : i === 1 ? '0 50%' : i === 2 ? '100% 50%' : '50% 0',
                    startValue = i < 2 ? -91 : 91,
                    rotationAxis = i === 0 || i === 3 ? 'X' : 'Y';

                styles[$.CSS_TRANSFORM_ORIGIN] = transformOrigin;
                styles[$.CSS_TRANSFORM] = 'rotate' + rotationAxis + '(' + startValue + 'deg)';

                var fold = $.getElement('div', 'fold', {}, styles);

                var img = new Image();
                var src = 'assets/img/cubes/cube0' + (i + 1) + '/side' + (this.faceIndex + 1) + '.jpg';
                img.src = AssetManager.get(src).uri();
                img.width = this.width;
                img.height = this.height;

                fold.appendChild(img);

                var shadow = $.getElement('div', 'shadow', {}, {});
                fold.appendChild(shadow);

                this.element.appendChild(fold);

                this.folds.push({
                    start: startValue,
                    axis: rotationAxis,
                    element: fold,
                    shadow: shadow
                });
            }
        }

        function animateFolds() {
            var _self = this;

            var indexes = [0, 1, 3, 2, 0, 1, 3, 2];
            indexes = indexes.splice(indexes.indexOf(this.cubeIndex), 4);

            indexes.forEach(function(index, i, arr) {
                var fold = _self.folds[index];
                if (i === 0) {
                    fold.element.style[$.CSS_TRANSFORM] = 'rotate' + fold.axis + '(0deg)';
                    fold.shadow.style.opacity = 0;
                    return;
                }

                var time = 200;
                var delay = i * time;

                Interpol.tween()
                    .from(fold.start)
                    .to(0)
                    .delay(delay)
                    .duration(time)
                    .step(function(val) {
                        fold.element.style[$.CSS_TRANSFORM] = 'rotate' + fold.axis + '(' + val + 'deg)';

                        /* If no dynamic lighting, remove all shadows and exit this function */
                        if (!Config.global.useDynamicLighting) {
                            fold.shadow.style.opacity = 0;
                            return;
                        }

                        /* Dynamic Lighting */
                        var foldTransform = $.getTransform(fold.element),
                            lightPosition = Vect3.rotate(_self.lightTransform.translate, Vect3.muls(foldTransform.rotate, -1));

                        var verticies = $.computeVertexData(fold.element);
                        var center = Vect3.divs(Vect3.sub(verticies.c, verticies.a), 2);
                        var normal = Vect3.normalize(Vect3.cross(Vect3.sub(verticies.b, verticies.a), Vect3.sub(verticies.c, verticies.a)));

                        var direction = Vect3.normalize(Vect3.sub(lightPosition, center));
                        var amount = 0.75 - Math.max(0, Vect3.dot(normal, direction)).toFixed(3);

                        if (fold.light !== amount) {
                            fold.light = amount;
                            fold.shadow.style.opacity = amount;
                        }
                    })
                    .complete(function() {
                        if (i === (arr.length - 1)) $.emitter.emit('fold_out_complete', _self.cubeRotation);
                    })
                    .start(function() {
                        $.emitter.emit('fold_out_start', index, time * 0.5);
                    });

            });
        }

        animateFolds.call(this);
    }
};

module.exports = Fold;