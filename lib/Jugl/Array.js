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
     * Namespace: Jugl.Array
     * The Jugl.Array namespace contains array utility functions.
     */
    Jugl.Array = {

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
        indexOf: function(array, obj) {
        
            for(var i=0; i < array.length; i++) {
                if (array[i] == obj) return i;
            }
            return -1;   
        }
        
    };

})();