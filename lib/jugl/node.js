/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires jugl.js
 */

/**
 * Namespace: _jugl.node
 * The _jugl.object namespace contains DOM node utility functions.
 */
_jugl.node = {

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
    appendChild: function(parent, child) {
        if(typeof(parent) == "string") {
            var obj = document.getElementById(parent);
            if(!obj) {
                throw Error("Element id not found: " + parent);
            }
            parent = obj;
        }
        if(typeof(child) == "string") {
            var obj = document.getElementById(child);
            if(!obj) {
                throw Error("Element id not found: " + child);
            }
            child = obj;
        }
        if(child.namespaceURI && child.xml) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = child.xml;
            var children = wrapper.childNodes;
            for(var i=0; i<children.length; ++i) {
                parent.appendChild(children[i]);
            }
        } else {
            if(parent.ownerDocument && parent.ownerDocument.importNode) {
                child = parent.ownerDocument.importNode(
                    child, true
                );
            }
            parent.appendChild(child);
        }
        return child;
    }

};    
