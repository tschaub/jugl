/**
 * Class: Jugl.Template
 * Instances of this class are used to process Jugl templates.  Create a new
 * instance with the <Jugl.Template> constructor.
 */
Jugl.Template = new Jugl.Class({
    
    /**
     * Property: element
     * {DOMElement} The DOM element that contains the template
     */
    element: null,
    
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
     * the template.
     */
    regExes: null,
    
    /**
     * Constructor: Jugl.Template
     * Create a new Jugl template.
     *
     * Parameters:
     * element - {DOMElement|String} A DOM element or id that contains the
     *           template
     * options - {Object} An optional object whose properties will be set on
     * the template.
     *
     * Return:
     * {Jugl.Template} A new Jugl template
     */
    initialize: function(element, options) {
        // set the template element
        if(typeof(element) == "string") {
            element = document.getElementById(element);
        }
        this.element = element;
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
     * Process all attributes of a template element and all child elements.  The
     * element is modified in place.
     *
     * Parameters:
     * context - {Object} An optional object to use as the initial scope.
     * clone - {Boolean} Process a clone of this element, leaving the original
     *         unmodified.  Defaults to false.
     * toString - {Boolean} Return a string instead of a DOM element.  Default
     *            to false.
     *
     * Return:
     * {DOMElement} A processed DOM element
     */
    process: function(context, clone, toString) {
        if(this.element.getAttributeNodeNS) {
            // this is a placeholder for now
            if(this.element.getAttributeNodeNS(Jugl.xhtmlns, Jugl.prefix)) {
                this.usingNS = true;
            }
        }
        var node = new Jugl.Node(this, this.element);
        if(clone) {
            node = node.clone();
        }
        if(context) {
            node.scope = context;
        }
        try {
            node.process();
        } catch (err) {
            Jugl.Console.error("Failed to process " +
                               this.element + " node");
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
    CLASS_NAME: "Jugl.Template"
});