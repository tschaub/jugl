(function() {
    
    // import
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";
    var Jugl = window[uri];

    /**
     * Class: Jugl.Element
     * Instances of this class contain a DOM element and methods to process
     * Jugl statements.  Create a new instance with the {<Jugl.Element>}
     * constructor.
     */
    Jugl.Element = Jugl.Class({
        
        /**
         * Property: template
         * {<Jugl.Template>} The template that this node belongs to.
         */
        template: null,
        
        /**
         * Property: node
         * {DOMElement} The DOM element that this represents.
         */
        node: null,
        
        /**
         * Property: scope
         * {Object} Represents the scope for this node.  Any defined values or
         * repeat variables will become properties of this object.
         */
        scope: null,
        
        /**
         * Constructor: Jugl.Element
         * Create a new Jugl node.
         *
         * Parameters:
         * template - {Jugl.Template} The template that this node belongs to.
         * node - {DOMElement} The DOM node that this node represents.
         *
         * Return:
         * {Jugl.Element} A new Jugl node.
         */
        initialize: function(template, node) {
            this.template = template;
            this.node = node;
            this.scope = new Object();
            this.scope.repeat = new Object();
        },
        
        /**
         * Method: clone
         * Create a deep clone of this node
         *
         * Return:
         * {Jugl.Element} A cloned copy of this node.
         */
        clone: function() {
            var node = this.node.cloneNode(true);
            var element = new Jugl.Element(this.template, node);
            Jugl.Util.extend(element.scope, this.scope);
            return element;
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
            var node;
            if(this.node.nodeType == 1) {
                if(this.template.usingNS) {
                    node = this.node.getAttributeNodeNS(Jugl.namespaceURI,
                                                              localName);
                } else {
                    node = this.node.getAttributeNode(Jugl.prefix + ":" +
                                                            localName);
                }
                if(node && !node.specified) {
                    node = false;
                }
            }
            var attribute;
            if(node) {
                attribute = new Jugl.Attribute(this, node, localName);
            } else {
                attribute = node;
            }
            return attribute;
        },
        
        /**
         * Method: setAttribute
         * Set an attribute on this node.  Doesn't currently support setting
         * attributes with namespaces.
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
         * Remove an attribute from this node.
         *
         * Parameters: 
         * attribute - {Jugl.Attribute} The attribute to be removed
         */
        removeAttributeNode: function(attribute) {
            this.node.removeAttributeNode(attribute.node);
        },
        
        /**
         * Method: getChildNodes
         * Get a list of child nodes.
         *
         * Return:
         * {Array(Jugl.Element)} An array of Jugl.Element children
         */
        getChildNodes: function() {
            var numNodes = this.node.childNodes.length;
            var children = new Array(numNodes);
            var node, scope;
            for(var i=0; i<numNodes; ++i) {
                node = new Jugl.Element(this.template, this.node.childNodes[i]);
                node.scope = Jugl.Util.extend({}, this.scope);
                children[i] = node;
            }
            return children;
        },
        
        /**
         * Method: removeChildNodes
         * Remove all child nodes of this node
         */
        removeChildNodes: function() {
            while(this.node.hasChildNodes()) {
                this.node.removeChild(this.node.firstChild);
            }
        },
        
        /**
         * Method: removeChild
         * Remove a child node from this one
         *
         * Parameters:
         * element - {Jugl.Element} The child to be removed
         *
         * Return:
         * {Jugl.Element} The removed node
         */
        removeChild: function(element) {
            this.node.removeChild(element.node);
            return node;
        },
        
        /**
         * Method: removeSelf
         * Remove this node from its parent.
         */
        removeSelf: function() {
            this.node.parentNode.removeChild(this.node);
        },
        
        /**
         * Method: appendChild
         * Append a child node to this element
         *
         * Parameters:
         * element - {Jugl.Element} The element to be added to this one
         */
        appendChild: function(element) {
            this.node.appendChild(element.node);
        },
        
        /**
         * Method: insertAfter
         * Insert a element immediately after this one.
         *
         * Parameters:
         * element - {Jugl.Element} The element to be added as a sibling of this
         *     one.
         */
        insertAfter: function(element) {
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
         * Insert a node immediately before this one.
         *
         * Parameters:
         * element - {Jugl.Element} The element to be added as a sibling of this
         *     one.
         */
        insertBefore: function(element) {
            var parent = this.node.parentNode;
            parent.insertBefore(element.node, this.node);
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
            // process attributes
            var attributes = this.getAttribute("attributes");
            if(attributes) {
                try {
                    attributes.process();
                } catch(err) {
                    Jugl.Console.error("Failed to process attributes attribute");
                    throw err;
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
            // process reflow
            var reflow = this.getAttribute("reflow");
            if(reflow) {
                try {
                    reflow.process();
                } catch (err) {
                    Jugl.Console.error("Failed to process reflow attribute");
                    throw err;
                }
            }
        },
        
        /**
         * Method: processChildNodes
         * Process all child nodes
         */
        processChildNodes: function() {
            var children = this.getChildNodes();
            for(var i=0; i<children.length; ++i) {
                try {
                    children[i].process();
                } catch (err) {
                    Jugl.Console.error("Failed to process child node: " + i);
                    throw err;
                }
            }
        },
    
        /**
         * Constant: CLASS_NAME
         * {String} Name of this class
         */
        CLASS_NAME: "Jugl.Element"
    });
    
})();