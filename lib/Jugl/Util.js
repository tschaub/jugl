
Jugl.Util = new Object();

/**
 * Extend one object with properties from another.  The original destination
 * object is modified by this method.
 * 
 * @param {Object} destination The object to be modified
 * @param {Object} source The object with properties to be added to the
 *                        destination
 * @type Object
 * @returns An extended version of the destination object.
from Prototype.js */
Jugl.Util.extend = function(destination, source) {
    for (property in source) {
      destination[property] = source[property];
    }
    return destination;
};


/**
 * Seems to exist already in FF, but not in MOZ.
 * 
 * @param {Array} array
 * @param {Object} obj
 */
Jugl.Util.indexOf = function(array, obj) {

    for(var i=0; i < array.length; i++) {
        if (array[i] == obj) return i;
    }
    return -1;   
};
