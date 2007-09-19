(function() {
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";

    var singleFile = (typeof window[uri] == "object" && window[uri].singleFile);    
    
    /**
     * Namespace: Jugl
     * All classes and methods are contained in the Jugl namespace.
     * This is defined in an anonymous function to deal with the single
     * file build case.
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
        namespaceURI: "http://namespace.jugl.org/",
        
        /**
         * Property: scriptName
         * {String} The relative path to this script
         */
        scriptName: (!singleFile) ? "lib/Jugl.js" : "Jugl.js",
        
        /**
         * Method: getScriptLocation
         * Get the path for all library scripts
         * 
         * Return:
         * {String} The base path for library scripts
         */
        getScriptLocation: function () {
            var scriptLocation = "";
            var scriptName = Jugl.scriptName;
     
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].getAttribute('src');
                if (src) {
                    var index = src.lastIndexOf(scriptName); 
                    // is it found, at the end of the URL?
                    if ((index > -1) && (index + scriptName.length == src.length)) {  
                        scriptLocation = src.slice(0, -scriptName.length);
                        break;
                    }
                }
            }
            return scriptLocation;
        }
    };
    
    /**
     * The singleFile is a flag indicating this file is being included
     * in a Single File Library build of the Jugl Library.
     *
     * When we are *not* part of a SFL build we dynamically include the
     * Jugl library code.
     *
     * When we *are* part of a SFL build we do not dynamically include the 
     * Jugl library code as it will be appended at the end of this file.
     */
    if (!singleFile) {
        var jsfiles = new Array(
            "Jugl/Util.js",
            "Jugl/Class.js",
            "Jugl/Async.js",
            "Jugl/Node.js",
            "Jugl/Attribute.js",
            "Jugl/Console.js",
            "Jugl/Template.js"
        ); // etc.
    
        var allScriptTags = "";
        var host = Jugl.getScriptLocation() + "lib/";
    
        for (var i = 0; i < jsfiles.length; i++) {
            if (/MSIE/.test(navigator.userAgent) ||
                /Safari/.test(navigator.userAgent)) {
                var currentScriptTag = "<script src='" + host + jsfiles[i] + "'></script>"; 
                allScriptTags += currentScriptTag;
            } else {
                var s = document.createElement("script");
                s.src = host + jsfiles[i];
                var h = document.getElementsByTagName("head").length ? 
                           document.getElementsByTagName("head")[0] : 
                           document.body;
                h.appendChild(s);
            }
        }
        if(allScriptTags) {
            document.write(allScriptTags);
        }
    }
    
    // export
    window[uri] = Jugl;

})();
