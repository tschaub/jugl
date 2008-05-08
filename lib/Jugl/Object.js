/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires Jugl.js
 */
(function() {
    
    // import
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";
    var Jugl = window[uri];

    /**
     * Namespace: Jugl.Object
     * The Jugl.Object namespace contains object utility functions.
     */
    Jugl.Object = {

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
        extend: function(destination, source) {
            destination = destination || {};
            source = source || {};
            for(property in source) {
                destination[property] = source[property];
            }
            return destination;
        }

    };    

})();