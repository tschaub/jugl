/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires Jugl/Class.js
 */
(function() {
    
    // import
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";
    var Jugl = window[uri];
    
    /**
     * Class: Jugl.Attribute
     * Instances of this class contain a DOM element and methods to process
     * Jugl statements.  Create a new instance with the {Jugl.Attribute}
     * constructor.
     */
    Jugl.Attribute = Jugl.Class({
       
        /**
         * Property: element
         * {<Jugl.Element>} The owner element of this attribute.
         */
        element: null,
        
        /**
         * Property: node
         * {AttributeElement} The DOM attribute node that this represents.
         */
        node: null,
        
        /**
         * Property: type
         * {String} The attribute type, one of the supported Jugl statement types.
         */
        type: null,
        
        /**
         * Property: nodeValue
         * {String} The value of this node, a Jugl expression.
         */
        nodeValue: null,
        
        /**
         * Property: template
         * {<Jugl.Template>} The template that this attribute belongs to.
         */
        template: null,
        
        /**
         * Constructor: Jugl.Attribute
         *
         * Parameters:
         * element - {Jugl.Element}
         * node - {AttributeNode}
         * type - {String} The localName of the attribute
         *
         * Return:
         * {Jugl.Attribute} A new Jugl attribute
         */
        initialize: function(element, node, type) {
            this.element = element;
            this.node = node;
            this.type = type;
            this.nodeValue = node.nodeValue;
            this.nodeName = node.nodeName;
            this.template = element.template;
        },
    
        /**
         * Method: splitAttributeValue
         * Split space-delimited attribute values.
         * 
         * Parameters: 
         * value - {String} Optional value to pass in.  If not included
         *         the nodeValue of the attribute node will be used.
         *
         * Return:
         * {Array} A two item array - items have excess spaces trimmed.
         */
        splitAttributeValue: function(value) {
            value = (value != null) ? value : this.nodeValue;
            var matches = this.template.regExes.trimSpace.exec(value);
            var items;
            if(matches && matches.length == 3) {
                items = [matches[1], matches[2]];
            }
            return items;
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
         * Split semicolon-delimited attributes into an array of
         * expressions
         *
         * Return:
         * {Array} An array of Jugl expressions.
         */
        getAttributeValues: function() {
            var trimmed = this.nodeValue.replace(/[\t\n]/g, "").replace(/;\s*$/, "");
            var tabbed = trimmed.replace(/;;/g, "\t");
            var newlined = tabbed.split(";").join("\n");
            return newlined.replace(/\t/g, ";").split(/\n/g);
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
         * the attribute based on its type.  Attribute processing results in DOM
         * manipulations.  This method calls the appropriate method in
         * <Jugl.Attribute.processAttribute>.
         *
         * Return:
         * {Boolean} The attribute was successfully processed.
         */
        process: function() {
            return this.processAttribute[this.type].apply(this, []);
        },
        
        /**
         * Method: evalInScope
         * Evaluate a Jugl expression given the scope of its node.
         * 
         * Return:
         * {Object} The result of the expression evaluated.
         */
        evalInScope: function(str) {
            var expression = "with(this.element.scope){" + str + "}";
            return eval(expression);
        },
    
        /**
         * Property: processAttribute
         * {Object} Contains methods to process attributes based on type.
         * These methods are called by <Jugl.Attribute.process>
         */
        processAttribute: {
    
            /**
             * Method: processAttribute.define
             * Add a variable to the element's scope.  This variable can be used
             * in other attributes on this element, or by child nodes.  Access
             * the value of the variable in an attribute the variable name.
             * Child nodes defining variables with the same name as parent nodes
             * overwrite those variables for their own scope (and the scope of any
             * child nodes).
             *
             * Return:
             * {Boolean} A variable was defined
             */
            "define": function() {
                var values = this.getAttributeValues();
                var pair;
                for(var i=0; i<values.length; ++i) {
                    pair = this.splitAttributeValue(values[i]);
                    this.element.scope[pair[0]] = this.evalInScope(pair[1]);
                }
                this.removeSelf();
                return true;
            },
    
            /**
             * Method: processAttribute.condition
             * Test the expression given in the attribute.  Continue processing
             * this element if the attribute's value expression evaluates to true.
             *
             * Return:
             * {Boolean} Continue processing this element.
             */
            "condition": function() {
                var proceed;
                try {
                    proceed = !!(this.evalInScope(this.nodeValue));
                } catch(err) {
                    var message = err.name + ": " + err.message + "\n" +
                                  "attribute: " + this.nodeName;
                    Jugl.Console.error(message);
                    throw err;
                }
                this.removeSelf();
                if(!proceed) {
                    this.element.removeSelf();
                }
                return proceed;
            },
    
            /**
             * Method: processAttribute.repeat
             * Replicate a subtree of your document.  The expression
             * is evaluated once for each item in an array or property in an object.
             * The expression should evaluate to an array or object. If the sequence
             * is empty, then the statement element is deleted, otherwise it is
             * repeated for each value in the sequence.
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
                var length = list.length;
                for(var i=0; i<length; ++i) {
                    element = this.element.clone();
                    element.scope[key] = list[i];
                    element.scope.repeat[key] = {
                        index: i,
                        number: i + 1,
                        even: !(i % 2),
                        odd: !!(i % 2),
                        start: (i == 0),
                        end: (i == length-1),
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
             * or structure in place of its children with the content statement.
             *
             * Return:
             * {Boolean} The attribute value was successfully evaluated.
             */
            "content": function() {
                var pair = this.splitExpressionPrefix();
                var str;
                try {
                    str = this.evalInScope(pair[1]);
                } catch(err) {
                    Jugl.Console.error("Failed to eval in element scope: " +
                                       pair[1]);
                    throw err;
                }
                this.removeSelf();
                if(pair[0] == 'structure') {
                    try {
                        this.element.node.innerHTML = str;
                    } catch(err) {
                        // for xml templates, exception thrown for invalid xml
                        var wrapper = document.createElement('div');
                        var msg;
                        try {
                            wrapper.innerHTML = str;
                        } catch(invalidHTML) {
                            msg = "Can't transform string into valid HTML : " +
                                  str;
                            Jugl.Console.error(msg);
                            throw invalidHTML;
                        }
                        if(this.element.node.xml && this.template.xmldom) {
                            while(this.element.node.firstChild) {
                                this.element.node.removeChild(
                                    this.element.node.firstChild
                                );
                            }
                            this.template.xmldom.loadXML(wrapper.outerHTML);
                            var children = this.template.xmldom.firstChild.childNodes;
                            try {
                                for(var i=0; i<children.length; ++i) {
                                    this.element.node.appendChild(children[i]);
                                }
                            } catch(invalidXML) {
                                msg = "Can't transform string into valid XHTML : " +
                                      str;
                                Jugl.Console.error(msg);
                                throw invalidXML;
                            }
                        } else {
                            try {
                                this.element.node.innerHTML = wrapper.innerHTML;
                            } catch(invalidXML) {
                                msg = "Can't transform string into valid XHTML : " +
                                      str;
                                Jugl.Console.error(msg);
                                throw invalidXML;
                            }
                        }
                    }
                } else {
                    var text;
                    if(this.element.node.xml && this.template.xmldom) {
                        text = this.template.xmldom.createTextNode(str);
                    } else {
                        text = document.createTextNode(str);
                    }
                    var child = new Jugl.Element(this.template, text);
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
                var str;
                try {
                    str = this.evalInScope(pair[1]);
                } catch(err) {
                    Jugl.Console.error("Failed to eval in element scope: " +
                                       pair[1]);
                    throw err;
                }
                this.removeSelf();
                if(pair[0] == 'structure') {
                    var wrapper = document.createElement('div');
                    try {
                        wrapper.innerHTML = str;
                    } catch(err) {
                        msg = "Can't transform string into valid HTML : " +
                              str;
                        Jugl.Console.error(msg);
                        throw err;
                    }
                    if(this.element.node.xml && this.template.xmldom) {
                        // The loadXML method does better if cast to HTML first
                        try {
                            this.template.xmldom.loadXML(wrapper.outerHTML);
                        } catch(err) {
                            msg = "Can't transform string into valid XML : " +
                                  str;
                            Jugl.Console.error(msg);
                            throw err;
                        }
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
                    var replacement = new Jugl.Element(this.template, text);
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
                for(var i=0; i<values.length; ++i) {
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
             * Remove the tag and leave contents in place.
             * Leave the contents of a tag in place while omitting the surrounding
             * start and end tag. If its expression evaluates to a false value,
             * then normal processing of the element continues. If the expression
             * evaluates to a true value, or there is no expression, the statement
             * tag is replaced with its contents.
             *
             * Return:
             * {Boolean} Continue processing this element.
             */
            "omit-tag": function() {
                var omit;
                try {
                    omit = ((this.nodeValue == "") ||
                            !!(this.evalInScope(this.nodeValue)));
                } catch(err) {
                    Jugl.Console.error("Failed to eval in element scope: " +
                                       this.nodeValue);
                    throw err;
                }
                this.removeSelf();
                if(omit) {
                    var children = this.element.getChildNodes();
                    var child;
                    for(var i=0; i<children.length; ++i) {
                        this.element.insertBefore(children[i]);
                    }
                    this.element.removeSelf();
                }
            },

            /**
             * Method: processAttribute.reflow
             * Trigger browser reflow after processing other attributes.
             * Given an empty string or any expression that evaluates
             * to true, a reflow will be triggered.  Given an expression
             * that evaluates to false (other than an empty string), no
             * action will be taken.
             *
             * Return:
             * {Boolean} Continue processing this element.
             */
            "reflow": function() {
                var reflow;
                try {
                    reflow = ((this.nodeValue == "") ||
                              !!(this.evalInScope(this.nodeValue)));
                } catch(err) {
                    Jugl.Console.error("Failed to eval in element scope: " +
                                       this.nodeValue);
                    throw err;
                }
                this.removeSelf();
                if(reflow) {
                    if(this.element.node.outerHTML) {
                        this.element.node.outerHTML = this.element.node.outerHTML;
                    } else {
                        this.element.node.innerHTML = this.element.node.innerHTML;
                    }
                }
            }
    
        },
        
        /**
         * Constant: CLASS_NAME
         * {String} Name of this class
         */
        CLASS_NAME: "Jugl.Attribute"
    });
   
})();