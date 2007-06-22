
/**
 * Namespace: Jugl.Class
 * Contains functions for Jugl style class creation and inheritance.
 */
Jugl.Class = {
    
    /**
     * Property: isPrototype
     * *Private.* Anonymous function used as a test during object instantiation
     * and to allow for inheritance.
     */
    isPrototype: function () {}, // magic anonymous value

    /**
     * Method: create
     * Called to create a new Jugl class.
     *
     * Return:
     * {Function} A Jugl class
     */
    create: function() {
        return function() {
            if (arguments && arguments[0] != Jugl.Class.isPrototype)
                this.initialize.apply(this, arguments);
        }
    },

    /**
     * Method: inherit
     * Allow for inheritance from one or more classes.
     *
     * Return:
     * A function prototype
     */
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
