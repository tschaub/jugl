/**
 * Class: Jugl.Node
 * Instances of this class contain a DOM element and methods to process
 * Jugl statements.  Create a new instance with the {Jugl.Node}
 * constructor.
 */
Jugl.Node = new Jugl.Class({
    
    /**
     * Property: parser
     * {<Jugl.Parser>} The parser processing this node.
     */
    parser: null,
    
    /**
     * Property: element
     * {DOMElement} The DOM element that this represents.
     */
    element: null,
    
    /**
     * Property: scope
     * {Object} Represents the scope for this node.  Any defined values or
     * repeat variables will become properties of this object.
     */
    scope: null,
    
    /**
     * Constructor: Jugl.Node
     * Create a new Jugl node.
     *
     * Parameters:
     * parser - {Jugl.Parser} The parser processing this node.
     * element - {DOMElement} The DOM element that this node represents.
     *
     * Return:
     * {Jugl.Node} A new Jugl node.
     */
    initialize: function(parser, element) {
        this.parser = parser;
        this.element = element;
        this.scope = new Object();
        this.scope.repeat = new Object();
    },
    
    /**
     * Method: clone
     * Create a deep clone of this node
     *
     * Return:
     * {Jugl.Node} A cloned copy of this node.
     */
    clone: function() {
        var element = this.element.cloneNode(true);
        var node = new Jugl.Node(this.parser, element);
        Jugl.Util.extend(node.scope, this.scope);
        return node;
    },

    /**
     * Method: getAttribute
     * Return an attribute from a node given a localName.
     *
     * Parameters:
     * localName - {String} The local name of the attribute
     *
     * Return
     * {<Jugl.Attribute>} The speficied attribute if it exists.  Returns false
     * if the attribute exists but is not specified.  Returns null if the
     * attribute doesn't exist.
     */
    getAttribute: function(localName) {
        var element;
        if(this.element.nodeType == 1) {
            if(this.parser.usingNS) {
                element = this.element.getAttributeNodeNS(Jugl.namespaceURI,
                                                          localName);
            } else {
                element = this.element.getAttributeNode(Jugl.prefix + ":" +
                                                        localName);
            }
            if(element && !element.specified) {
                element = false;
            }
        }
        var attribute;
        if(element) {
            attribute = new Jugl.Attribute(this, element, localName);
        } else {
            attribute = element;
        }
        return attribute;
    },
    
    /**
     * Method: removeAttributeNode
     * Remove an attribute from this node.
     *
     * Parameters: 
     * attribute - {Jugl.Attribute} The attribute to be removed
     */
    removeAttributeNode: function(attribute) {
        this.element.removeAttributeNode(attribute.element);
    },
    
    /**
     * Method: getChildNodes
     * Get a list of child nodes.
     *
     * Return:
     * {Array(Jugl.Node)} An array of Jugl.Node children
     */
    getChildNodes: function() {
        var children = [];
        var node, scope;
        for(var i=0; i<this.element.childNodes.length; ++i) {
            node = new Jugl.Node(this.parser, this.element.childNodes[i]);
            node.scope = Jugl.Util.extend({}, this.scope);
            children.push(node);
        }
        return children;
    },
    
    /**
     * Method: removeChildNodes
     * Remove all child nodes of this node
     */
    removeChildNodes: function() {
        while(this.element.hasChildNodes()) {
            this.element.removeChild(this.element.firstChild);
        }
    },
    
    /**
     * Method: removeChild
     * Remove a child node from this one
     *
     * Parameters:
     * node - {Jugl.Node} The child to be removed
     *
     * Return:
     * {Jugl.Node} The removed node
     */
    removeChild: function(node) {
        this.element.removeChild(node.element);
        return node;
    },
    
    /**
     * Method: removeSelf
     * Remove this node from its parent.
     */
    removeSelf: function() {
        this.element.parentNode.removeChild(this.element);
    },
    
    /**
     * Method: appendChild
     * Append a child node to this node
     *
     * Parameters:
     * node - {Jugl.Node} The node to be added to this one
     */
    appendChild: function(node) {
        this.element.appendChild(node.element);
    },
    
    /**
     * Method: insertAfter
     * Insert a node immediately after this one.
     *
     * Parameters:
     * node - {Jugl.Node} The node to be added as a sibling of this one
     */
    insertAfter: function(node) {
        var parent = this.element.parentNode;
        var sibling = this.element.nextSibling;
        if(sibling) {
            parent.insertBefore(node.element, sibling);
        } else {
            parent.appendChild(node.element);
        }
    },
    
    /**
     * Method: insertBefore
     * Insert a node immediately before this one.
     *
     * Parameters:
     * node - {Jugl.Node} The node to be added as a sibling of this one
     */
    insertBefore: function(node) {
        var parent = this.element.parentNode;
        parent.insertBefore(node.element, this.element);
    },

    /**
     * Method: process
     * Process all attributes on this node
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
        for(var i=0; i<series.length; ++i) {
            attribute = this.getAttribute(series[i]);
            if(attribute) {
                try {
                    keepProcessing = attribute.process();
                } catch (err) {
                    Jugl.Console.error("Failed to process " +
                                       series[i] + " attribute");
                    throw err;
                }
                if(!keepProcessing) {
                    return;
                }
            }
        }
        // process content or replace
        var content = this.getAttribute("content");
        if(content) {
            try {
                content.process();
            } catch (err) {
                Jugl.Console.error("Failed to process content attribute");
                throw err;
            }
        } else {
            var replace = this.getAttribute("replace");
            if(replace) {
                try {
                    replace.process();
                } catch (err) {
                    Jugl.Console.error("Failed to process replace attribute");
                    throw err;
                }
            }
        }
        if(!content && !replace) {
            // process child nodes
            this.processChildNodes();
        }
        // process omit-tag
        var omit = this.getAttribute("omit-tag");
        if(omit) {
            try {
                omit.process();
            } catch (err) {
                Jugl.Console.error("Failed to process omit-tag attribute");
                throw err;
            }
        }
    },
    
    /**
     * Method: processChildNodes
     * Process all child nodes
     */
    processChildNodes: function() {
        var element, child;
        var children = this.getChildNodes();
        for(var i=0; i<children.length; ++i) {
            try {
                children[i].process();
            } catch (err) {
                Jugl.Console.error("Failed to process " +
                                   children[i] + " node");
                throw err;
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} Name of this class
     */
    CLASS_NAME: "Jugl.Node"
});