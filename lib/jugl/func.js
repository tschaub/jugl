/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires jugl/__init__.js
 */

/**
 * Namespace: _jugl.func
 * The _jugl.func namespace contains function utility functions.
 */
_jugl.func = {

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
    bind: function(method, object) {
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
    }

};    
