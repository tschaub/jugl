/**
 * All classes and methods are contained in the Jugl namespace.
 * @class
 * @type Object
 */
Jugl = {
    
    /**
     * @type String
     * @member Jugl
     */
    prefix: "jugl",
    
    /**
     * @type String
     */
    namespaceURI: "http://jugl.org/ns#",
    
    /** do this for real */
    xmlns: "http://xmlsn.org",

    /**
     * @type String
     * @private
     */
    scriptName: typeof(_JUGL_SFL_) == "undefined" ? "lib/Jugl.js" : "Jugl.js",
    
    /**
     * @type String
     * @returns The path to this script
     * @private
     */
    getScriptLocation: function () {
        var scriptLocation = "";
        var SCRIPT_NAME = Jugl.scriptName;
 
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src');
            if (src) {
                var index = src.lastIndexOf(SCRIPT_NAME); 
                // is it found, at the end of the URL?
                if ((index > -1) && (index + SCRIPT_NAME.length == src.length)) {  
                    scriptLocation = src.slice(0, -SCRIPT_NAME.length);
                    break;
                }
            }
        }
        return scriptLocation;
    }
};

/**
 *
 * `_JUGL_SFL_` is a flag indicating this file is being included
 * in a Single File Library build of the Jugl Library.
 *
 * When we are *not* part of a SFL build we dynamically include the
 * Jugl library code.
 *
 * When we *are* part of a SFL build we do not dynamically include the 
 * Jugl library code as it will be appended at the end of this file.
 */
if (typeof(_JUGL_SFL_) == "undefined") {
    (function() {
    var jsfiles=new Array(
        "Jugl/Util.js",
        "Jugl/Class.js",
        "Jugl/Node.js",
        "Jugl/Attribute.js",
        "Jugl/Console.js",
        "Jugl/Parser.js"
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
    if (allScriptTags) document.write(allScriptTags);
    })();
}
