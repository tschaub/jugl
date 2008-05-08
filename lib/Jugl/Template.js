/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires Jugl/Class.js
 */

/**
 * Class: Jugl.Template
 * Instances of this class are used to process Jugl templates.  Create a new
 * instance with the <Jugl.Template> constructor.
 */
Jugl.Template = Jugl.Class({
    
    /**
     * Property: node
     * {DOMElement} The DOM element that contains the template
     */
    node: null,
    
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
    xmldom: window.ActiveXObject ? new ActiveXObject("Microsoft.XMLDOM") : null,
    
    /**
     * Property: regExes
     * {Object} Contains compiled regular expressions for use by
     * the template.
     */
    regExes: {
        trimSpace: (/^\s*(\w+)\s+(.*?)\s*$/)
    },
    
    /**
     * Property: loaded
     * {Boolean} The template is already loaded.  If a template is constructed
     * with a DOM element, this will immediately be set to true.  If the
     * template is constructed without a DOM element, this will be set to
     * true after load is called.
     */
    loaded: false,
    
    /**
     * Property: loading
     * {Boolean} The template is currently loading.  If the template is
     * constructed without a DOM element, this will be set to true after load
     * is complete.
     */
    loading: false,

    /**
     * Constructor: Jugl.Template
     * Create a new Jugl template.
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
     * url - {String} A URL that resolves to a Jugl template.  Used instead
     *     of specifying the node option (optional).
     * callback - {Function} In the case where a url is provided, the callback
     *     will be called when the template has loaded (optional).
     * scope - {Object} Object that will be set as the scope for the callback
     *     (optional).
     *
     * Return:
     * {Jugl.Template} A new Jugl template
     */
    initialize: function(config) {
        if(typeof config == "string" || (config && config.nodeType == 1)) {
            config = {node: config};
        }
        config = config || {};
        // set the template node
        if(typeof(config.node) == "string") {
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
        
    },
    
    /**
     * Method: process
     * Process all attributes of a template node and all child nodess.  The
     * node is modified in place.
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
     * {DOMElement} A processed DOM element
     */
    process: function(config) {
        if(config && !config.context && !config.clone && !config.string && !config.parent) {
            config = {context: config}
        }
        config = Jugl.Object.applyDefaults(config, {
            context: null,
            clone: false,
            string: false
        });
        if(this.node.getAttributeNodeNS) {
            // this is a placeholder for now
            if(this.node.getAttributeNodeNS(Jugl.xhtmlns, Jugl.prefix)) {
                this.usingNS = true;
            }
        }
        var element = new Jugl.Element(this, this.node);
        if(config.clone) {
            element = element.clone();
        }
        if(config.context) {
            element.scope = config.context;
        }
        try {
            element.process();
        } catch (err) {
            Jugl.Console.error("Failed to process " +
                               this.node.nodeName + " node");
            throw err;
        }
        
        // convert to string if toString is true
        var data;
        if(config.string) {
            if(element.node.innerHTML) {
                data = element.node.innerHTML;
            } else {
                if(this.xmldom) {
                    data = element.node.xml;
                } else {
                    var serializer = new XMLSerializer();
                    data = serializer.serializeToString(element.node);
                }
            }
        } else {
            data = element.node;
            if(config.parent) {
                if(config.clone) {
                    data = Jugl.Node.appendChild(config.parent, element.node);
                } else {
                    this.appendTo(config.parent);
                }
            }
        }
        
        return data;
    },

    /**
     * Method: load
     * Load the template from a URL asynchronously.  Calls the template's
     * <onLoad> function when finished loading.
     *
     * Parameters:
     * config - {String | Object} Object with properties for configuring the
     *     load.  If a string is sent instead, it will be used as the config
     *     url described below.
     *
     * Valid config:
     * url - {String} URL of source doc (required).
     * callback - {Function} Function to be called when template loads
     *     (optional).
     * scope - {Object} Object that will be set as the scope for the callback
     *     (optional).
     */
    load: function(config) {
        if(typeof config == "string") {
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
        Jugl.Request.loadTemplate(config.url, setNode, this);
    },
    
    /**
     * Method: appendTo
     * Append a processed template to a DOM element.
     *
     * Parameters:
     * parent - {DOMElement|String} A DOM element or id of element to
     *     append processed template to
     *
     * Returns:
     * {Jugl.Template} This template. 
     */
    appendTo: function(parent) {
        this.node = Jugl.Node.appendChild(parent, this.node);
        return this;
    },

    /**
     * Constant: CLASS_NAME
     * {String} Name of this class
     */
    CLASS_NAME: "Jugl.Template"
});
