
Jugl.Node = Jugl.Class.create();
Jugl.Node.prototype = {
    
    /**
     * @type Jugl.Parser
     * @private
     */
    parser: null,
    
    /**
     * @type DOMElement
     * @private
     */
    element: null,
    
    /**
     * @type Object
     */
    scope: null,
    
    /**
     * @param {Jugl.Parser} parser
     * @param {DOMElement} element
     */
    initialize: function(parser, element) {
        this.parser = parser;
        this.element = element;
        this.scope = new Object();
        this.scope.repeat = new Object();
    },
    
    clone: function() {
        var element = this.element.cloneNode(true);
        var node = new Jugl.Node(this.parser, element);
        Jugl.Util.extend(node.scope, this.scope);
        return node;
    },

    /**
     * Return an attribute from a node given a localName.
     *
     * @param {String} localName
     * @type Jugl.Attribute
     * @returns The speficied attribute if it exists.  Returns false if the
     *          attribute exists but is not specified.  Returns null if the
     *          attribute doesn't exist.
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
     * Remove an attribute from this node.
     *
     * @param {Jugl.Attribute} attribute
     */
    removeAttributeNode: function(attribute) {
        this.element.removeAttributeNode(attribute.element);
    },
    
    /**
     * Get a list of child nodes.
     *
     * @type Array(Jugl.Node)
     * @returns An array of Jugl.Node children
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
     * Remove all child nodes of this node
     */
    removeChildNodes: function() {
        while(this.element.hasChildNodes()) {
            this.element.removeChild(this.element.firstChild);
        }
    },
    
    /**
     * Remove this node from its parent.
     */
    removeSelf: function() {
        this.element.parentNode.removeChild(this.element);
    },
    
    /**
     * Append a child node to this node
     *
     * @param {Jugl.Node} node The node to be added to this one
     */
    appendChild: function(node) {
        this.element.appendChild(node.element);
    },
    
    /**
     * Insert a node immediately after this one.
     *
     * @param {Jugl.Node} node The node to be added as a sibling of this one
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
     * Insert a node immediately before this one.
     *
     * @param {Jugl.Node} node The node to be added as a sibling of this one
     */
    insertBefore: function(node) {
        var parent = this.element.parentNode;
        parent.insertBefore(node.element, this.element);
    },

    /**
     * Process all attributes on this node
     */
    process: function() {
        var keepProcessing = true;
        /**
         * The first three attribute types can be processed in series,
         * continuing if the attribute.process() call returns true,
         * bailing out otherwise.
         */
        var attribute;
        var series = ["define", "condition", "repeat"];
        for(var i=0; i<series.length; ++i) {
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
            keepProcessing = content.process();
            if(!keepProcessing) {
                return;
            }
        } else {
            var replace = this.getAttribute("replace");
            if(replace) {
                keepProcessing = replace.process();
                if(!keepProcessing) {
                    return;
                }
            }
        }
        if(!content && !replace) {
            // process child nodes
            var element, child;
            var children = this.getChildNodes();
            for(var i=0; i<children.length; ++i) {
                children[i].process();
            }
        }
    },
    
    /**
     * @type String
     * @final
     */
    CLASS_NAME: "Jugl.Node"
}