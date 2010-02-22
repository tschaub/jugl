/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.libjs.net/jugl/trunk/license.txt for the full license.
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
        for (key in scope) {
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
