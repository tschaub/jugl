/**
 * Class: Jugl.Parser
 * Instances of this class contain are used to process Jugl.  Create a new
 * instance with the <Jugl.Parser> constructor.
 */
Jugl.Parser = new Jugl.Class({
    
    /**
     * Property: usingNS
     * *Private.* Use DOM manipulations with namespaces 
     */
    usingNS: false,
    
    /**
     * Property: regExes
     * *Private.* {Object} Contains compiled regular expressions for use by
     * the parser.
     */
    regExes: null,
    
    /**
     * Constructor: Jugl.Parser
     * Create a new Jugl parser.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     * the parser.
     *
     * Return:
     * {Jugl.Parser} A new Jugl parser
     */
    initialize: function(options) {
        // compile regexes for reuse
        this.regExes = {
            trimSpace: (/^\s*(\w+)\s+(.*?)\s*$/)
        };
    },
    
    /**
     * Method: process
     * Process all attributes on a given element and all child elements.
     *
     * Parameters:
     * id - {String} The id of the element to process.
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
     * Constant: CLASS_NAME
     * {String} Name of this class
     */
    CLASS_NAME: "Jugl.Parser"
});