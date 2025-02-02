/*!
 * Jugl.js -- JavaScript Template Library
 *
 * Copyright 2007-2010 Tim Schaub
 * Released under the MIT license.  Please see 
 * http://github.com/tschaub/jugl/blob/master/license.txt for the full license.
 */

(function(){
/* ======================================================================
    __init__.js
   ====================================================================== */

/**
 * Copyright 2007-2010 Tim Schaub
 * Released under the MIT license.  Please see license.txt for the full license.
 */

/**
 * APINamespace: jugl
 * All public classes and methods are contained in the jugl namespace.
 */
var pub = {
    
    /**
     * APIProperty: prefix
     * {String} The namespace URI alias for attributes that act as jugl
     *     statements.
     */
    prefix: "jugl",
    
    /**
     * APIProperty: namespaceURI
     * {String} The namespace URI for attributes that act as jugl
     *     statements.  Default is null.  If null, the "jugl" prefix will be
     *     relied upon.  To use a different prefix (or if you prefer to specify
     *     the namespace uri, set jugl.namespaceURI before processing your
     *     template. The suggested namespace URI is
     *     http://libjs.net/projects/jugl/#namespace.
     */
    namespaceURI: null,

    /**
     * APIFunction: loadTemplate
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

/* ======================================================================
    Element.js
   ====================================================================== */

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
/* ======================================================================
    Template.js
   ====================================================================== */

/**
 * Copyright 2007-2010 Tim Schaub
 * Released under the MIT license.  Please see license.txt for the full license.
 *
 * @requires __init__.js
 */

/**
 * APIClass: jugl.Template
 * Instances of this class are used to process jugl templates.  Create a new
 *     instance with the <Template> constructor.
 */

/**
 * APIConstructor: jugl.Template
 * Create a new jugl template.
 *
 * Parameters:
 * config - {Object | DOMElement | String} An optional object with
 *     properties for configuring the template.  If a DOM element or string
 *     is passed, it will be used as the config node property described
 *     below.
 *
 * Valid config:
 * node - {DOMElement | String} A DOM element or id that contains the
 *     template (optional).
 * url - {String} A URL that resolves to a jugl template.  Used instead
 *     of specifying the node option (optional).
 * callback - {Function} In the case where a url is provided, the callback
 *     will be called when the template has loaded (optional).
 * scope - {Object} Object that will be set as the scope for the callback
 *     (optional).
 *
 * Return:
 * {jugl.Template} A new jugl template
 */
var Template = function(config) {
    config = config || {};
    if(typeof config === "string" || (config.nodeType === 1)) {
        config = {node: config};
    }
    // set the template node
    if(typeof(config.node) === "string") {
        config.node = document.getElementById(config.node);
        if(!config.node) {
            throw Error("Element id not found: " + config.node);
        }
    }
    if(config.node) {
        this.node = config.node;
        this.loaded = true;
    } else if(config.url) {
        this.load({
            url: config.url, callback: config.callback, scope: config.scope
        });
    }
};

extend(Template.prototype, {
    
    /**
     * APIProperty: node
     * {DOMElement} The DOM element that contains the template
     */
    node: null,
    
    /**
     * Property: usingNS
     * {Boolean} Use DOM manipulations with namespaces 
     */
    usingNS: false,
    
    /**
     * Property: xmldom
     * {ActiveX:XMLDOM} For browsers that need ActiveX to parse XML, this will
     *     be a XMLDOM object.
     */
    xmldom: window.ActiveXObject ? new ActiveXObject("Microsoft.XMLDOM") : null,
    
    /**
     * Property: trimSpace
     * {RegExp} Compiled regular expression for use by the template.
     */
    trimSpace: (/^\s*(\w+)\s+(.*?)\s*$/),
    
    /**
     * APIProperty: loaded
     * {Boolean} The template is already loaded.  If a template is constructed
     *     with a DOM element, this will immediately be set to true.  If the
     *     template is constructed without a DOM element, this will be set to
     *     true after load is called.
     */
    loaded: false,
    
    /**
     * APIProperty: loading
     * {Boolean} The template is currently loading.  If the template is
     *     constructed without a DOM element, this will be set to true after
     *     load is complete.
     */
    loading: false,

    /**
     * APIMethod: process
     * Process all attributes of a template node and all child nodess.  The
     *     node is modified in place.
     *
     * Parameters:
     * config - {Object} An optional object for configuring the template
     *     processing.  If none of the properties below are supplied, the
     *     config will be used as the context described below.
     *
     * Valid config:
     * context - {Object} An object to use as the initial scope, if not
     *     provided, window will be used.
     * clone - {Boolean} Process a clone of this node, leaving the original
     *     unmodified.  Defaults to false.
     * string - {Boolean} Return a string instead of a DOM element.  Defaults
     *     to false.
     * parent - {String || DOMElement} An id or actual DOM element to become
     *     the parent of the processed template.  Not valid with the string
     *     option.
     *
     * Return:
     * {DOMElement} A processed DOM element.
     */
    process: function(config) {
        var element, data;
        config = extend({context: null, clone: false, string: false}, config);
        this.usingNS = this.node.getAttributeNodeNS && pub.namespaceURI;
        element = new Element(this, this.node);
        if(config.clone || config.string) {
            element = element.clone();
        }
        if(config.context) {
            element.scope = config.context;
        }
        element.process();
        
        // convert to string if toString is true
        if(config.string) {
            if(element.node.innerHTML) {
                data = element.node.innerHTML;
            } else {
                if(this.xmldom) {
                    data = element.node.xml;
                } else {
                    data = (new XMLSerializer).serializeToString(element.node);
                }
            }
        } else {
            data = element.node;
            if(config.parent) {
                if(config.clone) {
                    data = appendChild(config.parent, element.node);
                } else {
                    this.appendTo(config.parent);
                }
            }
        }
        
        return data;
    },

    /**
     * APIMethod: load
     * Load the template from a URL asynchronously.
     *
     * Parameters:
     * config - {String | Object} Object with properties for configuring the
     *     load.  If a string is sent instead, it will be used as the config
     *     url described below.
     *
     * Valid config:
     * url - {String} URL of source doc (required).
     * callback - {Function} Function to be called when template loads.
     *     Function will be called with the template (optional).
     * failure - {Function} Function to be called in the event of a failure.
     *     Function will be called with the request object (optional).
     * scope - {Object} Object that will be set as the scope for the callback
     *     (optional).
     */
    load: function(config) {
        if(typeof config === "string") {
            config = {url: config};
        }
        config = config || {};
        this.loading = true;
        var setNode = function(template) {
            this.node = template.node;
            this.loading = false;
            this.loaded = true;
            if(config.callback) {
                config.callback.apply(config.scope, [template]);
            }
        }
        var failure;
        if(config.failure) {
            failure = (function() {
                return function(request) {
                    config.failure.call(config.scope, request);
                }
            })();
        }
        pub.loadTemplate({
            url: config.url,
            callback: setNode,
            failure: failure,
            scope: this
        });
    },
    
    /**
     * APIMethod: appendTo
     * Append a processed template to a DOM element.
     *
     * Parameters:
     * parent - {DOMElement|String} A DOM element or id of element to
     *     append processed template to
     *
     * Returns:
     * {jugl.Template} This template. 
     */
    appendTo: function(parent) {
        this.node = appendChild(parent, this.node);
        return this;
    }

});
/* ======================================================================
    Attribute.js
   ====================================================================== */

/**
 * Copyright 2007-2010 Tim Schaub
 * Released under the MIT license.  Please see license.txt for the full license.
 *
 * @requires __init__.js
 */

/**
 * Class: Attribute
 * Instances of this class contain a DOM element and methods to process
 *     jugl statements.  Create a new instance with the {Attribute}
 *     constructor.
 */

/**
 * Constructor: Attribute
 *
 * Parameters:
 * element - {Element}
 * node - {AttributeNode}
 * type - {String} The localName of the attribute
 *
 * Return:
 * {Attribute} A new jugl attribute
 */
var Attribute = function(element, node, type) {
    this.element = element;
    this.node = node;
    this.type = type;
    this.nodeValue = node.nodeValue;
    this.nodeName = node.nodeName;
    this.template = element.template;
};

extend(Attribute.prototype, {
   
    /**
     * Property: element
     * {<Element>} The owner element of this attribute.
     */
    
    /**
     * Property: node
     * {AttributeElement} The DOM attribute node that this represents.
     */
    
    /**
     * Property: type
     * {String} The attribute type, one of the supported jugl statement types.
     */
    
    /**
     * Property: nodeValue
     * {String} The value of this node, a jugl expression.
     */

    /**
     * Property: nodeName
     * {String} The name of this node.
     */
    
    /**
     * Property: template
     * {<Template>} The template that this attribute belongs to.
     */

    /**
     * Method: splitAttributeValue
     * Split space-delimited attribute values.
     * 
     * Parameters: 
     * value - {String} Optional value to pass in.  If not included
     *     the nodeValue of the attribute node will be used.
     *
     * Return:
     * {Array} A two item array.  Items have excess spaces trimmed.
     */
    splitAttributeValue: function(value) {
        value = (value != null) ? value : this.nodeValue;
        var matches = this.template.trimSpace.exec(value);
        return matches && matches.length === 3 && [matches[1], matches[2]];
    },
    
    /**
     * Method: splitExpressionPrefix
     * Split the optional type prefix off of a content or replace
     *     expression.
     * 
     * Return:
     * {Array} A two item array [prefix, expression].
     */
    splitExpressionPrefix: function() {
        var items = this.splitAttributeValue();
        if(!items || (items[0] != 'structure' && items[0] != 'text')) {
            items = [null, this.nodeValue];
        }
        return items;
    },

    /**
     * Method: getAttributeValues
     * Split semicolon-delimited attributes into an array of expressions.
     *
     * Return:
     * {Array} An array of jugl expressions.
     */
    getAttributeValues: function() {
        return this.nodeValue.replace(
            /[\t\n]/g, ""
        ).replace(
            /;\s*$/, ""
        ).replace(
            /;;/g, "\t"
        ).split(";").join("\n").replace(/\t/g, ";").split(/\n/g);
    },

    /**
     * Method: removeSelf
     * Remove this attribute from its node.
     */
    removeSelf: function() {
        this.element.removeAttributeNode(this);
    },
    
    /**
     * Method: process
     * Process this attribute.  This method is called by the template to process
     *     the attribute based on its type.  Attribute processing results in DOM
     *     manipulations.
     *
     * Return:
     * {Boolean} The attribute was successfully processed.
     */
    process: function() {
        return this.processAttribute[this.type].apply(this, []);
    },
    
    /**
     * Method: evalInScope
     * Evaluate a jugl expression given the scope of its node.
     * 
     * Return:
     * {Object} The result of the expression evaluated.
     */
    evalInScope: function(str) {
        var scope = this.element.scope;
        var args = [];
        var vals = [];
        for (var key in scope) {
            args.push(key);
            vals.push(scope[key]);
        }
        var evaluator = new Function(args.join(","), "return " + str);
        return evaluator.apply({}, vals);
    },

    /**
     * Property: processAttribute
     * {Object} Contains methods to process attributes based on type.
     *     These methods are called by <process>.
     */
    processAttribute: {

        /**
         * Method: processAttribute.define
         * Add a variable to the element's scope.  This variable can be used
         *     in other attributes on this element, or by child nodes.  Access
         *     the value of the variable in an attribute the variable name.
         *     Child nodes defining variables with the same name as parent nodes
         *     overwrite those variables for their own scope (and the scope of
         *     any child nodes).
         *
         * Return:
         * {Boolean} A variable was defined.
         */
        "define": function() {
            var pair, i, num, values = this.getAttributeValues();
            for(i=0, num=values.length; i<num; ++i) {
                pair = this.splitAttributeValue(values[i]);
                this.element.scope[pair[0]] = this.evalInScope(pair[1]);
            }
            this.removeSelf();
            return true;
        },

        /**
         * Method: processAttribute.condition
         * Test the expression given in the attribute.  Continue processing
         *     this element if the attribute's value expression evaluates to
         *     true.
         *
         * Return:
         * {Boolean} Continue processing this element.
         */
        "condition": function() {
            var proceed = !!(this.evalInScope(this.nodeValue));
            this.removeSelf();
            if(!proceed) {
                this.element.removeSelf();
            }
            return proceed;
        },

        /**
         * Method: processAttribute.repeat
         * Replicate a subtree of your document.  The expression is evaluated
         *     once for each item in an array or property in an object. The
         *     expression should evaluate to an array or object. If the sequence
         *     is empty, then the statement element is deleted, otherwise it is
         *     repeated for each value in the sequence.
         *
         * Return:
         * {Boolean} Continue processing this element.
         */
        "repeat": function() {
            var pair = this.splitAttributeValue();
            var key = pair[0];
            var list = this.evalInScope(pair[1]);
            this.removeSelf();
            /**
             * The repeat attribute sets the given variable to each element
             * in an array.  For objects (or anything besides an array)
             * the variable is set to each property in the object.  To get
             * a list of these properties, we iterate through them all here.
             */
            if(!(list instanceof Array)) {
                var items = new Array();
                for(var p in list) {
                    items.push(p);
                }
                list = items;
            }
            /**
             * Do the actual processing - inserting cloned nodes and finally
             * removing the original.
             */
            var element;
            var previousSibling = this.element;
            for(var i=0, length=list.length; i<length; ++i) {
                element = this.element.clone();
                element.scope[key] = list[i];
                element.scope.repeat[key] = {
                    index: i,
                    number: i + 1,
                    even: !(i % 2),
                    odd: !!(i % 2),
                    start: (i === 0),
                    end: (i === length-1),
                    length: length
                    // not handling letter or Letter at this point
                };
                previousSibling.insertAfter(element);
                element.process();
                previousSibling = element;
            }
            this.element.removeSelf();
            return false;
        },

        /**
         * Method: processAttribute.content
         * Rather than replacing an entire element, you can insert text
         *     or structure in place of its children with the content statement.
         *
         * Return:
         * {Boolean} The attribute value was successfully evaluated.
         */
        "content": function() {
            var pair = this.splitExpressionPrefix();
            var str = this.evalInScope(pair[1]);
            this.removeSelf();
            if(pair[0] === 'structure') {
                try {
                    this.element.node.innerHTML = str;
                } catch(err) {
                    // for xml templates, exception thrown for invalid xml
                    var wrapper = document.createElement('div');
                    wrapper.innerHTML = str;
                    if(this.element.node.xml && this.template.xmldom) {
                        while(this.element.node.firstChild) {
                            this.element.node.removeChild(
                                this.element.node.firstChild
                            );
                        }
                        this.template.xmldom.loadXML(wrapper.outerHTML);
                        var children = this.template.xmldom.firstChild.childNodes;
                        for(var i=0, num=children.length; i<num; ++i) {
                            this.element.node.appendChild(children[i]);
                        }
                    } else {
                        this.element.node.innerHTML = wrapper.innerHTML;
                    }
                }
            } else {
                var text;
                if(this.element.node.xml && this.template.xmldom) {
                    text = this.template.xmldom.createTextNode(str);
                } else {
                    text = document.createTextNode(str);
                }
                var child = new Element(this.template, text);
                this.element.removeChildNodes();
                this.element.appendChild(child);
            }
            return true;
        },

        /**
         * Method: processAttribute.replace
         * Replace the entire element with the result of the expression.
         * 
         * Return:
         * {Boolean} The attribute value was successfully evaluated.
         */
        "replace": function() {
            var pair = this.splitExpressionPrefix();
            var str = this.evalInScope(pair[1]);
            this.removeSelf();
            if(pair[0] === 'structure') {
                var wrapper = document.createElement('div');
                wrapper.innerHTML = str;
                if(this.element.node.xml && this.template.xmldom) {
                    // The loadXML method does better if cast to HTML first
                    this.template.xmldom.loadXML(wrapper.outerHTML);
                    wrapper = this.template.xmldom.firstChild;
                }
                while(wrapper.firstChild) {
                    var child = wrapper.removeChild(wrapper.firstChild);
                    if(this.element.node.ownerDocument &&
                       this.element.node.ownerDocument.importNode) {
                        if(child.ownerDocument != this.element.node.ownerDocument) {
                            child = this.element.node.ownerDocument.importNode(
                                child, true
                            );
                        }
                    }
                    this.element.node.parentNode.insertBefore(
                        child, this.element.node
                    );
                }
            } else {
                var text;
                if(this.element.node.xml && this.template.xmldom) {
                    text = this.template.xmldom.createTextNode(str);
                } else {
                    text = document.createTextNode(str);
                }
                var replacement = new Element(this.template, text);
                this.element.insertBefore(replacement);
            }
            this.element.removeSelf();
            return true;
        },

        /**
         * Method: processAttribute.attributes
         * Add attributes to this element.
         *
         * Return:
         * {Boolean} The attribute value was successfully evaluated.
         */
        "attributes": function() {
            var values = this.getAttributeValues();
            var pair, name, value;
            for(var i=0, num=values.length; i<num; ++i) {
                pair = this.splitAttributeValue(values[i]);
                name = pair[0];
                value = this.evalInScope(pair[1]);
                if(value !== false) {
                    this.element.setAttribute(name, value);
                }
            }
            this.removeSelf();
            return true;
        },

        /**
         * Method: processAttribute.omit-tag
         * Remove the tag and leave contents in place. Leave the contents of a
         *     tag in place while omitting the surrounding start and end tag.
         *     If its expression evaluates to a false value, then normal
         *     processing of the element continues. If the expression evaluates
         *     to a true value, or there is no expression, the statement tag
         *     is replaced with its contents.
         *
         * Return:
         * {Boolean} Continue processing this element.
         */
        "omit-tag": function() {
            var omit = ((this.nodeValue === "") ||
                    !!(this.evalInScope(this.nodeValue)));
            this.removeSelf();
            if(omit) {
                var children = this.element.getChildNodes();
                for(var i=0, num=children.length; i<num; ++i) {
                    this.element.insertBefore(children[i]);
                }
                this.element.removeSelf();
            }
        },

        /**
         * Method: processAttribute.reflow
         * Trigger browser reflow after processing other attributes.
         *     Given an empty string or any expression that evaluates
         *     to true, a reflow will be triggered.  Given an expression
         *     that evaluates to false (other than an empty string), no
         *     action will be taken.
         *
         * Return:
         * {Boolean} Continue processing this element.
         */
        "reflow": function() {
            var reflow = ((this.nodeValue === "") ||
                          !!(this.evalInScope(this.nodeValue)));
            this.removeSelf();
            if(reflow) {
                if(this.element.node.outerHTML) {
                    this.element.node.outerHTML = this.element.node.outerHTML;
                } else {
                    this.element.node.innerHTML = this.element.node.innerHTML;
                }
            }
        }

    }

});
/* ======================================================================
    __export__.js
   ====================================================================== */

/**
 * Copyright 2007-2010 Tim Schaub
 * Released under the MIT license.  Please see license.txt for the full license.
 *
 * @requires __init__.js
 */

// export
window.jugl = extend(pub, {Template: Template});
})();