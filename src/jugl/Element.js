/**
 * Copyright 2007-2010 Tim Schaub
 * Released under the MIT license.  Please see license.txt for the full license.
 *
 * @requires __init__.js
 */

/**
 * Class: Element
 * Instances of this class contain a DOM element and methods to process
 *     jugl statements.  Create a new instance with the {<Element>}
 *     constructor.
 */

/**
 * Constructor: Element
 * Create a new jugl element.
 *
 * Parameters:
 * template - {Template} The template that this element belongs to.
 * node - {DOMElement} The DOM node that this element represents.
 *
 * Return:
 * {Element} A new jugl element.
 */
var Element = function(template, node) {
    this.template = template;
    this.node = node;
    this.scope = {};
    this.scope.repeat = {};
};

extend(Element.prototype, {
    
    /**
     * Property: template
     * {<Template>} The template that this element belongs to.
     */
    
    /**
     * Property: node
     * {DOMElement} The DOM node that this element represents.
     */
    
    /**
     * Property: scope
     * {Object} Represents the scope for this element.  Any defined values or
     *     repeat variables will become properties of this object.
     */
    
    /**
     * Method: clone
     * Create a deep clone of this element.  Removes any id attribute from
     *     the clone.
     *
     * Return:
     * {Element} A cloned copy of this element.
     */
    clone: function() {
        var node = this.node.cloneNode(true);
        node.removeAttribute("id");
        var element = new Element(this.template, node);
        extend(element.scope, this.scope);
        return element;
    },

    /**
     * Method: getAttribute
     * Return an attribute from an element given a localName.
     *
     * Parameters:
     * localName - {String} The local name of the attribute
     *
     * Return
     * {<Attribute>} The speficied attribute if it exists.  Returns false
     *     if the attribute exists but is not specified.  Returns null if the
     *     attribute doesn't exist.
     */
    getAttribute: function(localName) {
        var node;
        if(this.node.nodeType === 1) {
            if(this.template.usingNS) {
                node = this.node.getAttributeNodeNS(
                    pub.namespaceURI, localName
                );
            } else {
                node = this.node.getAttributeNode(
                    pub.prefix + ":" + localName
                );
            }
            if(node && !node.specified) {
                node = false;
            }
        }
        var attribute;
        if(node) {
            attribute = new Attribute(this, node, localName);
        } else {
            attribute = node;
        }
        return attribute;
    },
    
    /**
     * Method: setAttribute
     * Set an attribute on this element.  Doesn't currently support setting
     *     attributes with namespaces.
     *
     * Parameters:
     * name - {String} Attribute name
     * value - {String} Attribute value
     */
    setAttribute: function(name, value) {
        this.node.setAttribute(name, value);
    },
    
    /**
     * Method: removeAttributeNode
     * Remove an attribute from this element.
     *
     * Parameters: 
     * attribute - {Attribute} The attribute to be removed
     */
    removeAttributeNode: function(attribute) {
        this.node.removeAttributeNode(attribute.node);
    },
    
    /**
     * Method: getChildNodes
     * Get a list of child elements.
     *
     * Return:
     * {Array(Element)} An array of children elements.
     */
    getChildNodes: function() {
        var numNodes = this.node.childNodes.length;
        var children = new Array(numNodes);
        var node;
        for(var i=0; i<numNodes; ++i) {
            node = new Element(this.template, this.node.childNodes[i]);
            node.scope = extend({}, this.scope);
            children[i] = node;
        }
        return children;
    },
    
    /**
     * Method: removeChildNodes
     * Remove all child nodes of this node.
     */
    removeChildNodes: function() {
        while(this.node.hasChildNodes()) {
            this.node.removeChild(this.node.firstChild);
        }
    },
    
    /**
     * Method: removeChild
     * Remove a child element from this one.
     *
     * Parameters:
     * element - {Element} The child to be removed
     *
     * Return:
     * {Element} The removed node
     */
    removeChild: function(element) {
        this.node.removeChild(element.node);
        return element;
    },
    
    /**
     * Method: removeSelf
     * Remove this element from its parent.
     */
    removeSelf: function() {
        this.node.parentNode.removeChild(this.node);
    },
    
    /**
     * Method: importNode
     * Import an element's node into the owner document of this element's
     *     node.
     *
     * Parameters:
     * element - {Element} The node to import.
     */
    importNode: function(element) {
        if(this.node.ownerDocument && this.node.ownerDocument.importNode) {
            if(element.node.ownerDocument !== this.node.ownerDocument) {
                element.node = this.node.ownerDocument.importNode(
                    element.node, true
                );
            }
        }
    },
    
    /**
     * Method: appendChild
     * Append a child element to this element.
     *
     * Parameters:
     * element - {Element} The element to be added to this one
     */
    appendChild: function(element) {
        this.importNode(element);
        this.node.appendChild(element.node);
    },
    
    /**
     * Method: insertAfter
     * Insert an element immediately after this one.
     *
     * Parameters:
     * element - {Element} The element to be added as a sibling of this
     *     one.
     */
    insertAfter: function(element) {
        this.importNode(element);
        var parent = this.node.parentNode;
        var sibling = this.node.nextSibling;
        if(sibling) {
            parent.insertBefore(element.node, sibling);
        } else {
            parent.appendChild(element.node);
        }
    },
    
    /**
     * Method: insertBefore
     * Insert an element immediately before this one.
     *
     * Parameters:
     * element - {Element} The element to be added as a sibling of this
     *     one.
     */
    insertBefore: function(element) {
        this.importNode(element);
        var parent = this.node.parentNode;
        parent.insertBefore(element.node, this.node);
    },

    /**
     * Method: process
     * Process all attributes on this element.
     */
    process: function() {
        /**
         * The first three attribute types can be processed in series,
         * continuing if the attribute.process() call returns true,
         * bailing out otherwise.  The return is only relevant for
         * condition statements.
         */
        var attribute;
        var keepProcessing = true;
        var series = ["define", "condition", "repeat"];
        for(var i=0, num=series.length; i<num; ++i) {
            attribute = this.getAttribute(series[i]);
            if(attribute) {
                keepProcessing = attribute.process();
                if(!keepProcessing) {
                    return;
                }
            }
        }
        // process content or replace
        var content = this.getAttribute("content");
        if(content) {
            content.process();
        } else {
            var replace = this.getAttribute("replace");
            if(replace) {
                replace.process();
            }
        }
        // process attributes
        var attributes = this.getAttribute("attributes");
        if(attributes) {
            attributes.process();
        }
        if(!content && !replace) {
            // process child nodes
            this.processChildNodes();
        }
        // process omit-tag
        var omit = this.getAttribute("omit-tag");
        if(omit) {
            omit.process();
        }
        // process reflow
        var reflow = this.getAttribute("reflow");
        if(reflow) {
            reflow.process();
        }
    },
    
    /**
     * Method: processChildNodes
     * Process all child elements.
     */
    processChildNodes: function() {
        var children = this.getChildNodes();
        for(var i=0, num=children.length; i<num; ++i) {
            children[i].process();
        }
    }

});
