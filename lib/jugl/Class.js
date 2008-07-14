/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @include jugl/object.js
 * @requires jugl/__init__.js
 */

/**
 * Class: _jugl.Class
 * Base class used to construct all other classes with multiple inheritance.
 * To create a new jugl style class, use the following syntax:
 * > MyClass = new _jugl.Class(prototype);
 *
 * To create a new jugl Style class with multiple inheritance, use the following
 * syntax:
 * > MyClass = new _jugl.Class(Class1, Class2, prototype);
 *
 */
_jugl.Class = function() {
    var Class = function() {
        if(this === jugl) {
            var msg = "Create an instance of a jugl " +
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
        _jugl.object.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};
