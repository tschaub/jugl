
Jugl.Parser = Jugl.Class.create();
Jugl.Parser.prototype = {
    
    /**
     * @type Boolean
     */
    usingNS: false,
    
    initialize: function(options) {
        // compile regexes for reuse
        this.regExes = {
            trimSpace: (/^\s*(\w+)\s+(.*?)\s*$/)
        };
    },
    
    process: function(id) {
        var element = document.getElementById(id);
        if(element.getAttributeNodeNS) {
            if(element.getAttributeNodeNS(Jugl.xmlns, Jugl.prefix)) {
                this.usingNS = true;
            }
        }
        var node = new Jugl.Node(this, element);
        node.process();
    },
    
    CLASS_NAME: "Jugl.Parser"
}