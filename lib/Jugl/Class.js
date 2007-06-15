
/* Jugl.Class metaclass */
Jugl.Class = {
    isPrototype: function () {}, // magic anonymous value

    create: function() {
        return function() {
            if (arguments && arguments[0] != Jugl.Class.isPrototype)
                this.initialize.apply(this, arguments);
        }
    },
 
    inherit: function () {
        var superClass = arguments[0];
        var proto = new superClass(Jugl.Class.isPrototype);
        for (var i = 1; i < arguments.length; i++) {
            if (typeof arguments[i] == "function") {
                var mixin = arguments[i];
                arguments[i] = new mixin(Jugl.Class.isPrototype);
            }
            Jugl.Util.extend(proto, arguments[i]);

            if((arguments[i].hasOwnProperty && arguments[i].hasOwnProperty('toString')) ||
               (!arguments[i].hasOwnProperty && arguments[i].toString)) {
                proto.toString = arguments[i].toString;
            }
        }
        return proto;
    }
};
