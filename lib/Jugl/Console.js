/**
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */

/*
 * @requires Jugl/Object.js
 */
(function() {
    
    // import
    var uri = "http://jugl.tschaub.net/trunk/lib/Jugl.js";
    var Jugl = window[uri];
    /**
     * Namespace: Jugl.Console
     * The Jugl.Console namespace is used for debugging and error logging.
     * If the Firebug Lite (../Firebug/firebug.js) is included before this script,
     * calls to Jugl.Console methods will get redirected to window.console.
     * This makes use of the Firebug extension where available and allows for
     * cross-browser debugging Firebug style.
     *
     * Note:
     * Note that behavior will differ with the Firebug extention and Firebug Lite.
     * Most notably, the Firebug Lite console does not currently allow for
     * hyperlinks to code or for clicking on object to explore their properties.
     * 
     */
    Jugl.Console = {
        /**
         * Create empty functions for all console methods.  The real value of these
         * properties will be set if Firebug Lite (../Firebug/firebug.js script) is
         * included.  We explicitly require the Firebug Lite script to trigger
         * functionality of the Jugl.Console methods.
         */
        
        /**
         * Function: log
         * Log an object in the console.  The Firebug Lite console logs string
         * representation of objects.  Given multiple arguments, they will
         * be cast to strings and logged with a space delimiter.  If the first
         * argument is a string with printf-like formatting, subsequent arguments
         * will be used in string substitution.  Any additional arguments (beyond
         * the number substituted in a format string) will be appended in a space-
         * delimited line.
         *
         * Examples:
         * (code)
         * // Firebug Lite logs someObject.toString()
         * Jugl.Console.log(someObject);
         * 
         * // string substitution
         * Jugl.Console.log("%s jumped over %s", cow, moon);
         * (end)
         * 
         * Parameters:
         * object - {Object}
         */
        log: function() {},
    
        /**
         * Function: debug
         * Writes a message to the console, including a hyperlink to the line
         * where it was called.
         *
         * May be called with multiple arguments as with Jugl.Console.log().
         * 
         * Parameters:
         * object - {Object}
         */
        debug: function() {},
    
        /**
         * Function: info
         * Writes a message to the console with the visual "info" icon and color
         * coding and a hyperlink to the line where it was called.
         *
         * May be called with multiple arguments as with Jugl.Console.log().
         * 
         * Parameters:
         * object - {Object}
         */
        info: function() {},
    
        /**
         * Function: warn
         * Writes a message to the console with the visual "warning" icon and
         * color coding and a hyperlink to the line where it was called.
         *
         * May be called with multiple arguments as with Jugl.Console.log().
         * 
         * Parameters:
         * object - {Object}
         */
        warn: function() {},
    
        /**
         * Function: error
         * Writes a message to the console with the visual "error" icon and color
         * coding and a hyperlink to the line where it was called.
         *
         * May be called with multiple arguments as with Jugl.Console.log().
         * 
         * Parameters:
         * object - {Object}
         */
        error: function() {},
    
        /**
         * Function: assert
         * Tests that an expression is true. If not, it will write a message to
         * the console and throw an exception.
         *
         * May be called with multiple arguments as with Jugl.Console.log().
         * 
         * Parameters:
         * object - {Object}
         */
        assert: function() {},
    
        /**
         * Function: dir
         * Prints an interactive listing of all properties of the object. This
         * looks identical to the view that you would see in the DOM tab.
         * 
         * Parameters:
         * object - {Object}
         */
        dir: function() {},
    
        /**
         * Function: dirxml
         * Prints the XML source tree of an HTML or XML element. This looks
         * identical to the view that you would see in the HTML tab. You can click
         * on any node to inspect it in the HTML tab.
         * 
         * Parameters:
         * object - {Object}
         */
        dirxml: function() {},
    
        /**
         * Function: trace
         * Prints an interactive stack trace of JavaScript execution at the point
         * where it is called.  The stack trace details the functions on the stack,
         * as well as the values that were passed as arguments to each function.
         * You can click each function to take you to its source in the Script tab,
         * and click each argument value to inspect it in the DOM or HTML tabs.
         * 
         */
        trace: function() {},
    
        /**
         * Function: group
         * Writes a message to the console and opens a nested block to indent all
         * future messages sent to the console. Call Jugl.Console.groupEnd()
         * to close the block.
         *
         * May be called with multiple arguments as with Jugl.Console.log().
         * 
         * Parameters:
         * object - {Object}
         */
        group: function() {},
    
        /**
         * Function: groupEnd
         * Closes the most recently opened block created by a call to
         * Jugl.Console.group
         */
        groupEnd: function() {},
        
        /**
         * Function: time
         * Creates a new timer under the given name. Call
         * Jugl.Console.timeEnd(name)
         * with the same name to stop the timer and print the time elapsed.
         *
         * Parameters:
         * name - {String}
         */
        time: function() {},
    
        /**
         * Stops a timer created by a call to Jugl.Console.time(name) and
         * writes the time elapsed.
         *
         * Parameters:
         * name - {String}
         */
        timeEnd: function() {},
    
        /**
         * Turns on the JavaScript profiler. The optional argument title would
         * contain the text to be printed in the header of the profile report.
         *
         * This function is not currently implemented in Firebug Lite.
         * 
         * Parameters:
         * title - {String} Optional title for the profiler
         */
        profile: function() {},
    
        /**
         * Turns off the JavaScript profiler and prints its report.
         * 
         * This function is not currently implemented in Firebug Lite.
         */
        profileEnd: function() {},
    
        /**
         * Writes the number of times that the line of code where count was called
         * was executed. The optional argument title will print a message in
         * addition to the number of the count.
         *
         * This function is not currently implemented in Firebug Lite.
         *
         * Parameters:
         * title - {String} Optional title to be printed with count
         */
        count: function() {}
    
    };
    
    /**
     * Execute an anonymous function to extend the Jugl.Console namespace
     * if the firebug.js script is included.  This closure is used so that the
     * "scripts" and "i" variables don't pollute the global namespace.
     */
    (function() {
        /**
         * If Firebug Lite is included (before this script), re-route all
         * Jugl.Console calls to the console object.
         */
        if(window.console) {
            var scripts = document.getElementsByTagName("script");
            for(var i=0; i<scripts.length; ++i) {
                if(scripts[i].src.indexOf("firebug.js") != -1) {
                    Jugl.Object.extend(Jugl.Console, console);
                    break;
                }
            }
        }
    })();

})();