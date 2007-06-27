/**
 * Class: Jugl.Parser
 * Instances of this class contain are used to process Jugl.  Create a new
 * instance with the <Jugl.Parser> constructor.
 */
Jugl.Parser = new Jugl.Class({
    
    /**
     * Property: usingNS
     * {Boolean} Use DOM manipulations with namespaces 
     */
    usingNS: false,
    
    /**
     * Property: xhtmlns
     * {String} Namespace URI for XHTML
     */
    xhtmlns: "http://www.w3.org/1999/xhtml",
    
    /**
     * Property: xmldom
     * {ActiveX:XMLDOM} For browsers that need ActiveX to parse XML, this will be a
     * XMLDOM object.
     */
    xmldom: null,
    
    /**
     * Property: regExes
     * {Object} Contains compiled regular expressions for use by
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
        if(window.ActiveXObject) {
            this.xmldom = new ActiveXObject("Microsoft.XMLDOM");
        }
    },
    
    /**
     * Method: process
     * Process all attributes on a given element and all child elements.  The
     * element is modified in place.
     *
     * Parameters:
     * element - {DOMElemen|String} A dom element or the id of the element to
     *           process.
     * scope - {Object} An optional object to use as the initial scope.
     * clone - {Boolean} Process a clone of this element, leaving the original
     *         unmodified.  Defaults to false.
     * toString - {Boolean} Return a string instead of a DOM element.  Default
     *            to false.
     *
     * Return:
     * {DOMElement} A processed DOM element
     */
    process: function(element, scope, clone, toString) {
        if(typeof(element) == "string") {
            element = document.getElementById(element);
        }
        if(element.getAttributeNodeNS) {
            // this is a placeholder for now
            if(element.getAttributeNodeNS(Jugl.xhtmlns, Jugl.prefix)) {
                this.usingNS = true;
            }
        }
        var node = new Jugl.Node(this, element);
        if(clone) {
            node = node.clone();
        }
        if(scope) {
            node.scope = scope;
        }
        try {
            node.process();
        } catch (err) {
            Jugl.Console.error("Failed to process " +
                               element + " node");
        }
        
        // convert to string if toString is true
        var data;
        if(toString) {
            if(node.element.innerHTML) {
                data = node.element.innerHTML;
            } else {
                if(this.xmldom) {
                    data = node.element.xml;
                } else {
                    var serializer = new XMLSerializer();
                    data = serializer.serializeToString(node.element);
                }
            }
        } else {
            data = node.element;
        }
        
        return data;
    },
    
    /**
     * Constant: CLASS_NAME
     * {String} Name of this class
     */
    CLASS_NAME: "Jugl.Parser"
});