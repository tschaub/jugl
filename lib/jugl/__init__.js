/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.libjs.net/jugl/trunk/license.txt for the full license.
 */

/**
 * Namespace: pub
 * All public classes and methods are contained in the pub namespace.
 */
var pub = {
    
    /**
     * Property: prefix
     * {String} The namespace URI alias for attributes that act as jugl
     *     statements.
     */
    prefix: "jugl",
    
    /**
     * Property: namespaceURI
     * {String} The namespace URI for attributes that act as jugl
     *     statements.  Default is null.  If null, the "jugl" prefix will be
     *     relied upon.  To use a different prefix (or if you prefer to specify
     *     the namespace uri, set jugl.namespaceURI before processing your
     *     template. The suggested namespace URI is
     *     http://libjs.net/jugl/#namespace.
     */
    namespaceURI: null,

    /**
     * Function: loadTemplate
     * Load a template from a URL asynchronously.
     *
     * Parameters:
     * config - {Object} Request configuration.
     *
     * Valid config properties:
     * url - {String} URL of source doc (required).
     * callback - {Function} Callback that will get called with one argument,
     *     the template from the requested document
     * failure - {Function} Callback that will be called in the event of a
     *     failure.  The callback will be called with the request object.
     * scope - {Object} Optional object that will be referred to as this in
     *     the callback
     */
    loadTemplate: function(config) {
        var createTemplate = function(request) {
            var doc, template,
                success = !request.status || (request.status >= 200 && request.status < 300);
            if(success) {
                try {
                    // try xml
                    doc = request.responseXML;
                    template = new Template(doc.documentElement);
                } catch(invalidXML) {
                    // try html
                    doc = document.createElement("div");
                    doc.innerHTML = request.responseText;
                    template = new Template(doc.firstChild);
                }
                if(config.callback) {
                    config.callback.call(config.scope, template);
                }
            } else if(config.failure) {
                config.failure.call(config.scope, request);
            }
        }
        loadUrl(config.url, createTemplate);
    }
    
};

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
var extend = function(destination, source) {
    destination = destination || {};
    source = source || {};
    for(var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

/**
 * Method: appendChild
 * Append a node to another, taking care with xml vs html and owner docs.
 *
 * Parameters:
 * parent - {DOMElement | String} A DOM element or id of an element that
 *     will become a parent.
 * child - {DOMElement | String} A DOM element or id of element to
 *     append to the parent.
 *
 * Returns:
 * {DOMElement} The child node.
 */
var appendChild = function(parent, child) {
    var obj, wrapper, children, i, num;
    if(typeof(parent) === "string") {
        obj = document.getElementById(parent);
        if(!obj) {
            throw Error("Element id not found: " + parent);
        }
        parent = obj;
    }
    if(typeof(child) === "string") {
        obj = document.getElementById(child);
        if(!obj) {
            throw Error("Element id not found: " + child);
        }
        child = obj;
    }
    if(child.namespaceURI && child.xml) {
        wrapper = document.createElement('div');
        wrapper.innerHTML = child.xml;
        children = wrapper.childNodes;
        for(i=0, num=children.length; i<num; ++i) {
            parent.appendChild(children[i]);
        }
    } else {
        if(parent.ownerDocument && parent.ownerDocument.importNode &&
           parent.ownerDocument !== child.ownerDocument) {
            child = parent.ownerDocument.importNode(
                child, true
            );
        }
        parent.appendChild(child);
    }
    return child;
};

/** 
 * Function: loadURL
 * Load a document from a URL asynchronously.
 *
 * Parameters:
 * url - {String} URL of source doc
 * callback - {Function} Callback that will get called with one argument,
 *     the completed request object.
 * scope - {Object} Optional object that will be referred to as this in
 *     the callback.
 *
 */
var loadUrl = function(url, callback, scope) {
    var request;
    if(typeof XMLHttpRequest !== "undefined") {
        request = new XMLHttpRequest();
    } else if (typeof ActiveXObject !== "undefined") {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        throw new Error("XMLHttpRequest not supported");
    }
    request.open("GET", url);
    request.onreadystatechange = function() {
        if(request.readyState === 4) {
            callback.call(scope, request);
        }
    }
    request.send(null);
};

