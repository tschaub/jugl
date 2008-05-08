/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires Jugl/Object.js
 */

/**
 * Class: Jugl.Class
 * Base class used to construct all other classes with multiple inheritance.
 * To create a new Jugl style class, use the following syntax:
 * > MyClass = new Jugl.Class(prototype);
 *
 * To create a new Jugl Style class with multiple inheritance, use the following
 * syntax:
 * > MyClass = new Jugl.Class(Class1, Class2, prototype);
 *
 */
Jugl.Class = function() {
    var Class = function() {
        if(this === Jugl) {
            var msg = "Create an instance of a Jugl " +
                      "class with the new keyword";
            throw Error(msg);
        }
        this.initialize.apply(this, arguments);
    }
    var extended = {
        toString: function() {
            return "[" + this.CLASS_NAME + "]";
        }
    };
    var parent;
    for(var i=0; i<arguments.length; ++i) {
        if(typeof arguments[i] == "function") {
            // get the prototype of the superclass
            parent = arguments[i].prototype;
        } else {
            // in this case we're extending with the prototype
            parent = arguments[i];
        }
        Jugl.Object.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};
