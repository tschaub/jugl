
/**
 * The Jugl.Console namespace is used for debugging and error logging.
 * If the Firebug Lite (../Firebug/firebug.js) is included before this script,
 * calls to Jugl.Console methods will get redirected to window.console.
 * This makes use of the Firebug extension where available and allows for
 * cross-browser debugging Firebug style.
 */
Jugl.Console = {};
(function() {
    /**
     * Create empty functions for all console methods.  The real value of these
     * properties will be set if Firebug Lite (../Firebug/firebug.js script) is
     * included.  We explicitly require the Firebug Lite script to trigger
     * functionality of the Jugl.Console methods.
     */
    var methods = ['log', 'debug', 'info', 'warn', 'error', 'assert',
                   'dir', 'dirxml', 'trace', 'group', 'groupEnd', 'time',
                   'timeEnd', 'profile', 'profileEnd', 'count'];
    for(var i=0; i<methods.length; ++i) {
        Jugl.Console[methods[i]] = function() {};
    }
    
    /**
     * If Firebug Lite is included (before this script), re-route all
     * Jugl.Console calls to the console object.
     */
    if(window.console) {
        var scripts = document.getElementsByTagName("script");
        for(var i=0; i<scripts.length; ++i) {
            if(scripts[i].src.indexOf("firebug.js") != -1) {
                Jugl.Util.extend(Jugl.Console, console);
                break;
            }
        }
    }
})();
