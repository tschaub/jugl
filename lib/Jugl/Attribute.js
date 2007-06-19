
Jugl.Attribute = Jugl.Class.create();
Jugl.Attribute.prototype = {
    
    /**
     * @param {Jugl.Node} node
     * @param {AttributeNode} element
     * @param {String} type The localName of the attribute
     */
    initialize: function(node, element, type) {
        this.node = node;
        this.element = element;
        this.type = type;
        this.nodeValue = element.nodeValue;
        this.nodeName = element.nodeName;
        this.parser = node.parser;
    },

    /**
     * @param {String} value Optional value to pass in.  If not included
     *                       the nodeValue of the attribute node will be used.
     * @private
     */
    splitAttributeValue: function(value) {
        value = (value != null) ? value : this.nodeValue;
        var matches = this.parser.regExes.trimSpace.exec(value);
        var items;
        if(matches.length == 3) {
            items = [matches[1], matches[2]];
        }
        return items;
    },
    
    /**
     * @private
     */
    getAttributeValues: function() {
        var trimmed = this.nodeValue.replace(/[\t\n]/g, "").replace(/;\s*$/, "");
        var tabbed = trimmed.replace(/;;/g, "\t");
        var newlined = tabbed.split(";").join("\n");
        return newlined.replace(/\t/g, ";").split(/\n/g);
    },

    /**
     * Remove this attribute from its node.
     */
    removeSelf: function() {
        this.node.removeAttributeNode(this);
    },
    
    /**
     * Process this attribute.
     */
    process: function() {
        return this.processAttribute[this.type].apply(this, []);
    },
    
    /**
     * @private
     */
    evalInScope: function(str) {
        var expression = "with(this.node.scope){" + str + "}";
        return eval(expression);
    },

    /**
     * @private
     */
    processAttribute: {

        /**
         * Add a variable to the node's scope.  This variable can be used
         * in other attributes on this node, or by child nodes.  Access
         * the value of the variable in an attribute the variable name.
         * Child nodes defining variables with the same name as parent nodes
         * overwrite those variables for their own scope (and the scope of any
         * child nodes).
         *
         * @type Boolean
         * @returns A variable was defined
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
         * Test the expression given in the attribute.  Continue processing
         * this node if the attribute's value expression evaluates to true.
         *
         * @type Boolean
         * @returns Continue processing this node.
         */
        "condition": function() {
            var bool;
            try {
                bool = !!(this.evalInScope(this.nodeValue));
            } catch(err) {
                var message = err.name + ": " + err.message + "\n";
                message += "attribute: " + this.nodeName;
                Jugl.Console.error(message);
                Jugl.Console.dirxml(this.node.element);
                Jugl.Console.log(this.node.scope);
            }
            this.removeSelf();
            if(!bool) {
                this.node.removeSelf();
            }
            return bool;
        },

        /**
         * Replicate a subtree of your document once for each item in an array
         * or property in an object. The expression should evaluate to an
         * array or object. If the sequence is empty, then the statement element
         * is deleted, otherwise it is repeated for each value in the sequence.
         * 
         * @type Boolean
         * @returns Continue processing this node.
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
         * Rather than replacing an entire node, you can insert text or
         * structure in place of its children with the content statement.
         * @type Boolean
         * @returns The attribute value was successfully evaluated.
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
            var child = new Jugl.Node(this.parser,
                                      document.createTextNode(str));
            this.node.removeChildNodes();
            this.node.appendChild(child);
            return true;
        },

        /**
         * @type Boolean
         * @returns The attribute value was successfully evaluated.
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
            var replacement = new Jugl.Node(this.parser,
                                            document.createTextNode(str));
            this.node.insertBefore(replacement);
            this.node.removeSelf();
            return true;
        },

        /**
         * @type Boolean
         * @returns The attribute value was successfully evaluated.
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
         * Leave the contents of a tag in place while omitting the surrounding
         * start and end tag. If its expression evaluates to a false value,
         * then normal processing of the element continues. If the expression
         * evaluates to a true value, or there is no expression, the statement
         * tag is replaced with its contents.
         *
         * @type Boolean
         * @returns Continue processing this node.
         */
        "omit-tag": function() {
            var bool;
            try {
                bool = ((this.nodeValue == "") ||
                        !!(this.evalInScope(this.nodeValue)));
            } catch(err) {
                Jugl.Console.error("Failed to eval in node scope: " +
                                   this.nodeValue);
                throw err;
            }
            this.removeSelf();
            if(bool) {
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
     * @type String
     * @final
     */
    CLASS_NAME: "Jugl.Attribute"
}