
Jugl.Parser = Jugl.Class.create();
Jugl.Parser.prototype = {
    
    /**
     * @type Boolean
     * @private
     */
    usingNS: false,
    
    /**
     * @param {Object} options
     */
    initialize: function(options) {
        // compile regexes for reuse
        this.regExes = {
            trimSpace: (/^\s*(\w+)\s+(.*?)\s*$/)
        };
    },
    
    /**
     * Process all attributes on a given element and all child elements.
     *
     * @param {String} id The id of the element to process.
     */
    process: function(id) {
        var element = document.getElementById(id);
        if(element.getAttributeNodeNS) {
            // this is a placeholder for now
            if(element.getAttributeNodeNS(Jugl.xmlns, Jugl.prefix)) {
                this.usingNS = true;
            }
        }
        var node = new Jugl.Node(this, element);
        try {
            node.process();
        } catch (err) {
            Jugl.Console.error("Failed to process " +
                               element + " node");
        }
    },
    
    /**
     * @type String
     * @final
     */
    CLASS_NAME: "Jugl.Parser"
}