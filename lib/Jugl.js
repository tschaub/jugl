(function() {
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";

    var singleFile = (typeof window[uri] == "object" && window[uri].singleFile);    
    
    /**
     * Namespace: Jugl
     * All classes and methods are contained in the Jugl namespace.
     */
    var Jugl = {
        
        /**
         * Property: prefix
         * {String} The namespace URI alias for attributes that act as Jugl
         * statements.
         */
        prefix: "jugl",
        
        /**
         * Property: namespaceURI
         * {String} The namespace URI for attributes that act as Jugl
         * statements.
         */
        namespaceURI: "http://namespace.jugl.org/"
        
    };
    
    // export
    window[uri] = Jugl;

})();
