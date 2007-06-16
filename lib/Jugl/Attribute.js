
Jugl.Attribute = Jugl.Class.create();
Jugl.Attribute.prototype = {
    
    /**
     * @param {Jugl.Node} node
     * @param {AttributeNode} element
     * @param {String} type The localName of the attribute
     */
    initialize: function(node, element, type) {
        this.owner = node;
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
        this.owner.removeAttributeNode(this);
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
        var expression = "with(this.owner.scope){" + str + "}";
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
        define: function() {
            var values = this.getAttributeValues();
            var pair;
            for(var i=0; i<values.length; ++i) {
                pair = this.splitAttributeValue(values[i]);
                this.owner.scope[pair[0]] = this.evalInScope(pair[1]);
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
        condition: function() {
            var bool;
            try {
                bool = !!(this.evalInScope(this.nodeValue));
            } catch(err) {
                var message = err.name + ": " + err.message + "\n";
                message += "attribute: " + this.nodeName;
                Jugl.Console.error(message);
                Jugl.Console.dirxml(this.owner.element);
                Jugl.Console.log(this.owner.scope);
            }
            this.removeSelf();
            if(!bool) {
                this.owner.removeSelf();
            }
            return bool;
        },

        /**
         * @type Boolean
         * @returns Continue processing this node.
         */
        repeat: function() {
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
            var previousSibling = this.owner;
            var length = list.length;
            for(var i=0; i<length; ++i) {
                node = this.owner.clone();
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
            this.owner.removeSelf();
            return false;
        },

        /**
         * @type Boolean
         * @returns The attribute value was successfully evaluated.
         */
        content: function() {
            var str;
            try {
                str = this.evalInScope(this.nodeValue);
            } catch(err) {
                var message = err.name + ": " + err.message + "\n";
                message += "attribute: " + this.nodeName;
                Jugl.Console.error(message);
                Jugl.Console.dirxml(this.owner.element);
                Jugl.Console.log(this.owner.scope);
            }
            this.removeSelf();
            var child = new Jugl.Node(this.parser,
                                      document.createTextNode(str));
            this.owner.removeChildNodes();
            this.owner.appendChild(child);
            return true;
        },

        /**
         * @type Boolean
         * @returns The attribute value was successfully evaluated.
         */
        replace: function() {
            // not yet implemented
            return false;
        },

        /**
         * @type Boolean
         * @returns The attribute value was successfully evaluated.
         */
        attributes: function() {
            // not yet implemented
            return false;
        }
    },
    
    /**
     * @type String
     * @final
     */
    CLASS_NAME: "Jugl.Attribute"
}