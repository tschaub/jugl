/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

(function() {

    var jsfiles = new Array(
        "../lib/Jugl.js",
        "../lib/Jugl/Object.js",
        "../lib/Jugl/Array.js",
        "../lib/Jugl/Function.js",
        "../lib/Jugl/Class.js",
        "../lib/Jugl/Request.js",
        "../lib/Jugl/Element.js",
        "../lib/Jugl/Attribute.js",
        "../lib/Jugl/Console.js",
        "../lib/Jugl/Template.js"
    );
    
    var appendable = !(/MSIE/.test(navigator.userAgent) ||
                       /Safari/.test(navigator.userAgent));
    var pieces = new Array(jsfiles.length);

    var element = document.getElementsByTagName("head").length ?
                    document.getElementsByTagName("head")[0] :
                    document.body;
    var script;

    for(var i=0; i<jsfiles.length; i++) {
        if(!appendable) {
            pieces[i] = "<script src='" + jsfiles[i] + "'></script>"; 
        } else {
            script = document.createElement("script");
            script.src = jsfiles[i];
            element.appendChild(script);
        }
    }
    if(!appendable) {
        document.write(pieces.join(""));
    }
})();
