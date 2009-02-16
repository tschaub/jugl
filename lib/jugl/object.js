/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 *
 * @requires __init__.js
 */

/**
 * Namespace: _jugl.object
 * The _jugl.object namespace contains object utility functions.
 */
_jugl.object = {

    /**
     * Function: extend
     * Extend one object with properties from another.  The original destination
     *     object is modified by this method.
     *
     * Parameters:
     * destination - {Object} The object to be modified
     * source - {Object} The object with properties to be added to the
     *     destination
     *
     * Return:
     * {Object} An extended version of the destination object.
     */
    extend: function(destination, source) {
        destination = destination || {};
        source = source || {};
        for(var property in source) {
            destination[property] = source[property];
        }
        return destination;
    },
    
    /**
     * Function: defaults
     * Apply all properties of a source object to the destination if
     *     corresponding destination properties are undefined.
     *
     * Parameters:
     * destination - {Object} The object to be modified
     * source - {Object} The object with properties to be added to the
     *     destination
     *
     * Return:
     * {Object} The destination object with defaults from the source.
     */
    defaults: function(destination, source) {
        destination = destination || {};
        source = source || {};
        for(var property in source) {
            if(destination[property] === undefined) {
                destination[property] = source[property];
            }
        }
        return destination;
    }

};    
