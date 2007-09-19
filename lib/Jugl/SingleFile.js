/**
 * File: Jugl.SingleFile
 * This file is only included for the single file build
 */
(function() {

    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";
    var Jugl = {
        singleFile: true
    };

    // export
    window[uri] = Jugl;

})();

