/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires __init__.js
 */

/**
 * Namespace: _jugl.request
 * This namespace contains functions for asynchronous document loading and
 * parsing.
 */
_jugl.request = {
    
    /**
     * Function: loadTemplate
     * Load a template from a URL asynchronously.
     *
     * Parameters:
     * url - {String} URL of source doc
     * onComplete - {Function} Callback that will get called with one argument,
     *              the template from the requested document
     * caller - {Object} Optional object that will be referred to as this in
     *          the callback
     */
    loadTemplate: function(url, onComplete, caller) {
        var createTemplate = function(request) {
            var doc, template;
            try {
                // try xml
                doc = request.responseXML;
                template = new jugl.Template(doc.documentElement);
            } catch(invalidXML) {
                try {
                    // try html
                    doc = document.createElement("div");
                    doc.innerHTML = request.responseText;
                    template = new jugl.Template(doc.firstChild);
                } catch(invalidHTML) {
                    var msg = "Can't make HTML out of response: " +
                              request.responseText;
                    _jugl.console.error(msg);
                    throw invalidHTML;
                }
            }
            var complete = _jugl.func.bind(onComplete, caller);
            complete(template);
        }
        _jugl.request.loadUrl(url, createTemplate);
    },
    
    /** 
     * Function: loadURL
     * Load a document from a URL asynchronously.
     *
     * Parameters:
     * url - {String} URL of source doc
     * onComplete - {Function} Callback that will get called with one argument,
     *              the completed request object
     * caller - {Object} Optional object that will be referred to as this in
     *          the callback
     *
     */
    loadUrl: function(url, onComplete, caller) {
        var complete = (caller) ?
                       _jugl.func.bind(onComplete, caller) : onComplete;

        var request = _jugl.request.createXMLHttpRequest();
        request.open("GET", url);
        request.onreadystatechange = function() {
            if(request.readyState == 4) {
                complete(request);
            }
        }
        request.send(null);
    },

    /**
     * Function: createXMLHttpRequest
     * Create a cross-browser XMLHttpRequest object
     *
     * Return:
     * {Object} A XMLHttpRequest (or equivalent) object
     */
    createXMLHttpRequest: function() {
        if(typeof XMLHttpRequest != "undefined") {
            return new XMLHttpRequest();
        } else if (typeof ActiveXObject != "undefined") {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            throw new Error("XMLHttpRequest not supported");
        }
    }

};

