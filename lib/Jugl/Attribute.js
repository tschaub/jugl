/**
 * Class: Jugl.Attribute
 * Instances of this class contain a DOM element and methods to process
 * Jugl statements.  Create a new instance with the {Jugl.Attribute}
 * constructor.
 */
Jugl.Attribute = new Jugl.Class({
    
    /**
     * Property: node
     * {<Jugl.Node>} The owner node of this attribute.
     */
    node: null,
    
    /**
     * Property: element
     * {AttributeElement} The DOM attribute element that this represents.
     */
    element: null,
    
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
     * node - {Jugl.Node}
     * element - {AttributeNode}
     * type - {String} The localName of the attribute
     *
     * Return:
     * {Jugl.Attribute} A new Jugl attribute
     */
    initialize: function(node, element, type) {
        this.node = node;
        this.element = element;
        this.type = type;
        this.nodeValue = element.nodeValue;
        this.nodeName = element.nodeName;
        this.template = node.template;
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
        if(matches.length == 3) {
            items = [matches[1], matches[2]];
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
        this.node.removeAttributeNode(this);
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
        var expression = "with(this.node.scope){" + str + "}";
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
         * Add a variable to the node's scope.  This variable can be used
         * in other attributes on this node, or by child nodes.  Access
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
                this.node.scope[pair[0]] = this.evalInScope(pair[1]);
            }
            this.removeSelf();
            return true;
        },

        /**
         * Method: processAttribute.condition
         * Test the expression given in the attribute.  Continue processing
         * this node if the attribute's value expression evaluates to true.
         *
         * Return:
         * {Boolean} Continue processing this node.
         */
        "condition": function() {
            var proceed;
            try {
                proceed = !!(this.evalInScope(this.nodeValue));
            } catch(err) {
                var message = err.name + ": " + err.message + "\n";
                message += "attribute: " + this.nodeName;
                Jugl.Console.error(message);
                Jugl.Console.dirxml(this.node.element);
                Jugl.Console.log(this.node.scope);
            }
            this.removeSelf();
            if(!proceed) {
                this.node.removeSelf();
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
         * {Boolean} Continue processing this node.
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
            var node;
            var previousSibling = this.node;
            var length = list.length;
            for(var i=0; i<length; ++i) {
                node = this.node.clone();
                node.scope[key] = list[i];
                node.scope.repeat[key] = {
                    index: i,
                    number: i + 1,
                    even: !(i % 2),
                    odd: !!(i % 2),
                    start: (i == 0),
                    end: (i == length-1),
                    length: length
                    // not handling letter or Letter at this point
                };
                previousSibling.insertAfter(node);
                node.process();
                previousSibling = node;
            }
            this.node.removeSelf();
            return false;
        },

        /**
         * Method: processAttribute.content
         * Rather than replacing an entire node, you can insert text
         * or structure in place of its children with the content statement.
         *
         * Return:
         * {Boolean} The attribute value was successfully evaluated.
         */
        "content": function() {
            var str;
            try {
                str = this.evalInScope(this.nodeValue);
            } catch(err) {
                Jugl.Console.error("Failed to eval in node scope: " +
                                   this.nodeValue);
                throw err;
            }
            this.removeSelf();
            var child = new Jugl.Node(this.template,
                                      document.createTextNode(str));
            this.node.removeChildNodes();
            this.node.appendChild(child);
            return true;
        },

        /**
         * Method: processAttribute.replace
         * Replace the entire node with the result of the expression.
         * 
         * Return:
         * {Boolean} The attribute value was successfully evaluated.
         */
        "replace": function() {
            var str;
            try {
                str = this.evalInScope(this.nodeValue);
            } catch(err) {
                Jugl.Console.error("Failed to eval in node scope: " +
                                   this.nodeValue);
                throw err;
            }
            this.removeSelf();
            var replacement = new Jugl.Node(this.template,
                                            document.createTextNode(str));
            this.node.insertBefore(replacement);
            this.node.removeSelf();
            return true;
        },

        /**
         * Method: processAttribute.attributes
         * Add attributes to this node.
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
            }
            this.removeSelf();
            return false;
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
         * {Boolean} Continue processing this node.
         */
        "omit-tag": function() {
            var omit;
            try {
                omit = ((this.nodeValue == "") ||
                        !!(this.evalInScope(this.nodeValue)));
            } catch(err) {
                Jugl.Console.error("Failed to eval in node scope: " +
                                   this.nodeValue);
                throw err;
            }
            this.removeSelf();
            if(omit) {
                var children = this.node.getChildNodes();
                var child;
                for(var i=0; i<children.length; ++i) {
                    this.node.insertBefore(children[i]);
                }
                this.node.removeSelf();
            }
        }

    },
    
    /**
     * Constant: CLASS_NAME
     * {String} Name of this class
     */
    CLASS_NAME: "Jugl.Attribute"
});