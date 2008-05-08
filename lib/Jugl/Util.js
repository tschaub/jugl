(function() {
    
    // import
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";
    var Jugl = window[uri];

    /**
     * Namespace: Jugl.Util
     * The Jugl.Util namespace contains general utility functions.
     */
    Jugl.Util = new Object();
    
    /**
     * Function: extend
     * Extend one object with properties from another.  The original destination
     * object is modified by this method.
     *
     * Parameters:
     * destination - {Object} The object to be modified
     * source - {Object} The object with properties to be added to the
     *          destination
     *
     * Return:
     * {Object} An extended version of the destination object.
     */
    Jugl.Util.extend = function(destination, source) {
        destination = destination || {};
        source = source || {};
        for(property in source) {
            destination[property] = source[property];
        }
        return destination;
    };
    
    
    /**
     * Function: indexOf
     * Get the index of an object in an array
     *
     * Parameters:
     * array - {Array} The array to search
     * obj - {Object} The object to search for
     *
     * Return:
     * {Integer} The index of the object in the array.  Returns -1 if not found.
     */
    Jugl.Util.indexOf = function(array, obj) {
    
        for(var i=0; i < array.length; i++) {
            if (array[i] == obj) return i;
        }
        return -1;   
    };
    
    /**
     * Function: bind
     * Bind an object to a function.  If called with more than two arguments, any
     * additional arguments will be prepended to the arguments array when the
     * function is called.
     * 
     * Parameters:
     * method - {Function} A function to call with object as this
     * object - {Object} The object that will be named this when function is called
     * 
     * Return:
     * {Function} A function that will refer to the passed in object as this
     */
    Jugl.Util.bind = function(method, object) {
        var args = [];
        for(var i=2; i<arguments.length; ++i) {
            args.push(arguments[i]);
        }
        return function() {
            for(var i=0; i<arguments.length; ++i) {
                args.push(arguments[i]);
            }
            return method.apply(object, args);
        }
    };

})();