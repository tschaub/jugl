(function() {
    
    // import
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";
    var Jugl = window[uri];
    
    /**
     * Namespace: Jugl.Request
     * This namespace contains functions for asynchronous document loading and
     * parsing.
     */
    Jugl.Request = {
        
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
                    template = new Jugl.Template(doc.documentElement);
                } catch(invalidXML) {
                    try {
                        // try html
                        doc = document.createElement("div");
                        doc.innerHTML = request.responseText;
                        template = new Jugl.Template(doc.firstChild);
                    } catch(invalidHTML) {
                        var msg = "Can't make HTML out of response: " +
                                  request.responseText;
                        Jugl.Console.error(msg);
                        throw invalidHTML;
                    }
                }
                var complete = Jugl.Util.bind(onComplete, caller);
                complete(template);
            }
            Jugl.Request.loadUrl(url, createTemplate);
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
                           Jugl.Util.bind(onComplete, caller) : onComplete;
    
            var request = Jugl.Request.createXMLHttpRequest();
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
    
})();

