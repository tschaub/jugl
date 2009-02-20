/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.libjs.net/jugl/trunk/license.txt for the full license.
 *
 * @requires __init__.js
 */

/**
 * APIClass: jugl.Template
 * Instances of this class are used to process jugl templates.  Create a new
 *     instance with the <Template> constructor.
 */

/**
 * APIConstructor: jugl.Template
 * Create a new jugl template.
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
 * url - {String} A URL that resolves to a jugl template.  Used instead
 *     of specifying the node option (optional).
 * callback - {Function} In the case where a url is provided, the callback
 *     will be called when the template has loaded (optional).
 * scope - {Object} Object that will be set as the scope for the callback
 *     (optional).
 *
 * Return:
 * {jugl.Template} A new jugl template
 */
var Template = function(config) {
    config = config || {};
    if(typeof config === "string" || (config.nodeType === 1)) {
        config = {node: config};
    }
    // set the template node
    if(typeof(config.node) === "string") {
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
};

extend(Template.prototype, {
    
    /**
     * APIProperty: node
     * {DOMElement} The DOM element that contains the template
     */
    node: null,
    
    /**
     * Property: usingNS
     * {Boolean} Use DOM manipulations with namespaces 
     */
    usingNS: false,
    
    /**
     * Property: xmldom
     * {ActiveX:XMLDOM} For browsers that need ActiveX to parse XML, this will
     *     be a XMLDOM object.
     */
    xmldom: window.ActiveXObject ? new ActiveXObject("Microsoft.XMLDOM") : null,
    
    /**
     * Property: trimSpace
     * {RegExp} Compiled regular expression for use by the template.
     */
    trimSpace: (/^\s*(\w+)\s+(.*?)\s*$/),
    
    /**
     * APIProperty: loaded
     * {Boolean} The template is already loaded.  If a template is constructed
     *     with a DOM element, this will immediately be set to true.  If the
     *     template is constructed without a DOM element, this will be set to
     *     true after load is called.
     */
    loaded: false,
    
    /**
     * APIProperty: loading
     * {Boolean} The template is currently loading.  If the template is
     *     constructed without a DOM element, this will be set to true after
     *     load is complete.
     */
    loading: false,

    /**
     * APIMethod: process
     * Process all attributes of a template node and all child nodess.  The
     *     node is modified in place.
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
     * {DOMElement} A processed DOM element.
     */
    process: function(config) {
        var element, data;
        config = extend({context: null, clone: false, string: false}, config);
        this.usingNS = this.node.getAttributeNodeNS && pub.namespaceURI;
        element = new Element(this, this.node);
        if(config.clone) {
            element = element.clone();
        }
        if(config.context) {
            element.scope = config.context;
        }
        element.process();
        
        // convert to string if toString is true
        if(config.string) {
            if(element.node.innerHTML) {
                data = element.node.innerHTML;
            } else {
                if(this.xmldom) {
                    data = element.node.xml;
                } else {
                    data = (new XMLSerializer).serializeToString(element.node);
                }
            }
        } else {
            data = element.node;
            if(config.parent) {
                if(config.clone) {
                    data = appendChild(config.parent, element.node);
                } else {
                    this.appendTo(config.parent);
                }
            }
        }
        
        return data;
    },

    /**
     * APIMethod: load
     * Load the template from a URL asynchronously.
     *
     * Parameters:
     * config - {String | Object} Object with properties for configuring the
     *     load.  If a string is sent instead, it will be used as the config
     *     url described below.
     *
     * Valid config:
     * url - {String} URL of source doc (required).
     * callback - {Function} Function to be called when template loads.
     *     Function will be called with the template (optional).
     * failure - {Function} Function to be called in the event of a failure.
     *     Function will be called with the request object (optional).
     * scope - {Object} Object that will be set as the scope for the callback
     *     (optional).
     */
    load: function(config) {
        if(typeof config === "string") {
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
        var failure;
        if(config.failure) {
            failure = (function() {
                return function(request) {
                    config.failure.call(config.scope, request);
                }
            })();
        }
        pub.loadTemplate({
            url: config.url,
            callback: setNode,
            failure: failure,
            scope: this
        });
    },
    
    /**
     * APIMethod: appendTo
     * Append a processed template to a DOM element.
     *
     * Parameters:
     * parent - {DOMElement|String} A DOM element or id of element to
     *     append processed template to
     *
     * Returns:
     * {jugl.Template} This template. 
     */
    appendTo: function(parent) {
        this.node = appendChild(parent, this.node);
        return this;
    }

});
