var $ = require('../utilities');
var Vect3 = require('../cube/vect3');

var Phone = {
    init: function(elem) {
        this.element = elem;
        this.translate = { X : 0, Y : 0, Z : 0 };
        this.rotation = { X : 0, Y : 0, Z : 0 };
        this.scale = { X : 1, Y : 1 };
        this.nextFaceIndex = 0;

        /* Select the `light` from DOM */
        this.light = $('[role="light"]')[0];
        
        /* The light never moves so define the `lightTransform` on `init` */
        this.lightTransform = $.getTransform(this.light);

        this.faces = $('.face', elem);
        this.faceData = this.faces.map(function(face) {
            var shadowSel = $('.shadow', face),
                highlightSel = $('.highlight', face);

            var obj = { face: face };
            if (highlightSel.length) obj.highlight = highlightSel[0];
            if (shadowSel.length) obj.shadow = shadowSel[0];

            return obj;
        }).map(function(obj) {
            var verticies = $.computeVertexData(obj.face);
            if ('highlight' in obj) obj.highlight.style.opacity = 0;
            if ('shadow' in obj) obj.shadow.style.opacity = 0;
            return $.extend(obj, {
                verticies: verticies,
                normal: Vect3.normalize(Vect3.cross(Vect3.sub(verticies.b, verticies.a), Vect3.sub(verticies.c, verticies.a))),
                center: Vect3.divs(Vect3.sub(verticies.c, verticies.a), 2)
            });
        });

        this.render();

    },
    render: function() {
        this.element.style[$.CSS_TRANSFORM] = 'rotateX(' + this.rotation.X + 'deg) ' +
            'rotateY(' + this.rotation.Y + 'deg) ' +
            'rotateZ(' + this.rotation.Z + 'deg) ' +
            'translateX(' + this.translate.X + 'px) ' +
            'translateY(' + this.translate.Y + 'px) ' +
            'translateZ(' + this.translate.Z + 'px) ' +
            'scale(' + this.scale.X + ',' + this.scale.Y + ')';

        /* Dynamic Lighting */
        var face, direction, amount,
            faceNum = 0, faceCount = this.faceData.length,
            cubeTransform = $.getTransform(this.element),
            lightPosition = Vect3.rotate(this.lightTransform.translate, Vect3.muls(cubeTransform.rotate, -1));

        while (++faceNum < faceCount) {
            face = this.faceData[this.nextFaceIndex];
            direction = Vect3.normalize(Vect3.sub(lightPosition, face.center));
            amount = 1 - Math.max(0, Vect3.dot(face.normal, direction)).toFixed(3);
            if (face.light != amount) {
                face.light = amount;
                if ('shadow' in face) face.shadow.style.opacity = amount;
                var val = 1 - (amount * 2);
                if ('highlight' in face) {
                    face.highlight.style.opacity = val;
                    face.highlight.style[$.CSS_TRANSFORM] = 'translateZ(2px) scaleY(' + val * 1.2 + ')';
                }
            }
            this.nextFaceIndex = (this.nextFaceIndex + 1) % faceCount;
        }
    }
};

module.exports = Phone;