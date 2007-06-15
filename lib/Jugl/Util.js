
Jugl.Util = new Object();

/* from Prototype.js */
Jugl.Util.extend = function(destination, source) {
    for (property in source) {
      destination[property] = source[property];
    }
    return destination;
};


/** Seems to exist already in FF, but not in MOZ.
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
