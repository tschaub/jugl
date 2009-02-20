var fdoc = function(config) {
    if(config.fn) {
        fdoc.docFn(config);
        if(config.exp) {
            fdoc.docTest(config);
        }
    } else if(config.el) {
        fdoc.docEl(config);
    }
};

fdoc.tests = [];

fdoc.addTest = function(config) {
    fdoc.tests.push(config);
};

fdoc.runTest = function(config) {
    var func = config.fn;
    var got = func();
    var exp = config.exp;
    return {got: got, exp: exp};
};

fdoc.docTest = function(config) {
    var test = fdoc.runTest(config);
    var results = fdoc.equals(test);
    if(results.pass) {
        // do appropriate type check
        fdoc.docEl({el: test.got});
    } else {
        fdoc.docStr({str: results.msg});
        fdoc.docStr({str: "got:"});
        fdoc.docEl({el: test.got});
        fdoc.docStr({str: "expected:"});
        fdoc.docEl({el: test.exp});
    }
};

fdoc.equals = function(results) {
    // check for type
    return fdoc.el.eq(results.got, results.exp, "Failure");
};

fdoc.docEl = function(config) {
    var el = config.el;
    var wrapper = document.createElement("div");
    wrapper.appendChild(fdoc.el.stripClass(el.cloneNode(true)));
    fdoc.doc({str: "        " + wrapper.innerHTML, type: "html"});
};

fdoc.docStr = function(config) {
    config.type = "plain";
    fdoc.doc(config);
};

fdoc.docFn = function(config) {
    var func = config.fn;
    var funcStr = func.toString()
        .replace(/\n/g, "\t")
        .replace(/^\s*function.*?{\t*(.*)$/i, "$1")
        .replace(/(.*?)\s*}\s*$/, "$1");
    var match = funcStr.match(/^(.*?)\s*return\s*(.*);?\s*$/i);
    var bodyStr = match[1];
    var retStr = match[2];
    if(retStr) {
        bodyStr += "\t    " + retStr;
    }
    fdoc.doc({str: bodyStr.replace(/\t/g, "\n"), type: "js"});
};

fdoc.doc = function(config) {
    var pre = document.createElement("pre");
    pre.className = "brush: " + config.type + "; gutter: false;";
    pre.appendChild(document.createTextNode(config.str));
    var scripts = document.getElementsByTagName("script");
    var parent = scripts[scripts.length-1].parentNode;
    parent.appendChild(pre);
};

fdoc.el = function(el, id) {
    if(typeof el === "string") {
        el = document.getElementById(el);
    }
    el = fdoc.el.stripClass(fdoc.el.stripId(el.cloneNode(true)));
    if(id) {
        el.id = id;
    }
    return el;
};

fdoc.el.stripId = function(el) {
    el.removeAttribute("id");
    return el;
};
fdoc.el.stripClass = function(el) {
    var names = el.className && el.className.split(/\s+/);
    if(names) {
        var remaining = [];
        var name;
        for(var i=0, len=names.length; i<len; ++i) {
            name = names[i];
            if(name.indexOf("fdoc-") !== 0) {
                remaining.push(name);
            }
        }
        if(remaining.length > 0) {
            el.className = remaining.join(" ");
        } else {
            el.removeAttribute("class");
        }
    }
    return el;
};


/**
 * Function: fdoc.el.createNode
 * Given a string, try to create an XML DOM node.  Throws string messages
 *     on failure.
 * 
 * Parameters:
 * text - {String} An XML string.
 *
 * Returns:
 * {DOMElement} An element node.
 */
fdoc.el.createNode = function(text) {
        
    var index = text.indexOf('<');
    if(index > 0) {
        text = text.substring(index);
    }
    
    var doc;
    if(window.ActiveXObject && !this.xmldom) {
        doc = new ActiveXObject("Microsoft.XMLDOM");
        try {
            doc.loadXML(text);
        } catch(err) {
            throw "ActiveXObject loadXML failed: " + err;
        }
    } else if(window.DOMParser) {
        try {
            doc = new DOMParser().parseFromString(text, 'text/xml');
        } catch(err) {
            throw "DOMParser.parseFromString failed";
        }
        if(doc.documentElement && doc.documentElement.nodeName == "parsererror") {
            throw "DOMParser.parseFromString returned parsererror";
        }
    } else {
        var req = new XMLHttpRequest();
        req.open("GET", "data:text/xml;charset=utf-8," +
                 encodeURIComponent(text), false);
        if(req.overrideMimeType) {
            req.overrideMimeType("text/xml");
        }
        req.send(null);
        doc = req.responseXML;
    }
    
    var root = doc.documentElement;
    if(!root) {
        throw "no documentElement";
    }
    return root;
};
    
/**
 * Function fdoc.el.assertEqual
 * Test two objects for equivalence (based on ==).  Throw an exception
 *     if not equivalent.
 * 
 * Parameters:
 * got - {Object}
 * expected - {Object}
 * msg - {String} The message to be thrown.  This message will be appended
 *     with ": got {got} but expected {expected}" where got and expected are
 *     replaced with string representations of the above arguments.
 */
fdoc.el.assertEqual = function(got, expected, msg) {
    if(got === undefined) {
        got = "undefined";
    } else if (got === null) {
        got = "null";
    }
    if(expected === undefined) {
        expected = "undefined";
    } else if (expected === null) {
        expected = "null";
    }
    if(got != expected) {
        throw msg + ": got '" + got + "' but expected '" + expected + "'";
    }
};
    
/**
 * Function fdoc.el.assertElementNodesEqual
 * Test two element nodes for equivalence.  Nodes are considered equivalent
 *     if they are of the same type, have the same name, have the same
 *     namespace prefix and uri, and if all child nodes are equivalent.
 *     Throws a message as exception if not equivalent.
 * 
 * Parameters:
 * got - {DOMElement}
 * expected - {DOMElement}
 * options - {Object} Optional object for configuring test options.
 *
 * Valid options:
 * prefix - {Boolean} Compare element and attribute
 *     prefixes (namespace uri always tested).  Default is false.
 * includeWhiteSpace - {Boolean} Include whitespace only nodes when
 *     comparing child nodes.  Default is false.
 */
fdoc.el.assertElementNodesEqual = function(got, expected, options) {
    var testPrefix = (options && options.prefix === true);
    
    // compare types
    fdoc.el.assertEqual(got.nodeType, expected.nodeType, "Node type mismatch");
    
    // compare names
    var gotName = testPrefix ?
        got.nodeName : got.nodeName.split(":").pop();
    var expName = testPrefix ?
        expected.nodeName : expected.nodeName.split(":").pop();
    fdoc.el.assertEqual(gotName, expName, "Node name mismatch");
    
    // for text nodes compare value
    if(got.nodeType == 3) {
        fdoc.el.assertEqual(
            got.nodeValue, expected.nodeValue, "Node value mismatch"
        );
    }
    // for element type nodes compare namespace, attributes, and children
    else if(got.nodeType == 1) {
        
        // test namespace alias and uri
        if(got.prefix || expected.prefix) {
            if(testPrefix) {
                fdoc.el.assertEqual(
                    got.prefix, expected.prefix,
                    "Bad prefix for " + got.nodeName
                );
            }
        }
        if(got.namespaceURI || expected.namespaceURI) {
            fdoc.el.assertEqual(
                got.namespaceURI, expected.namespaceURI,
                "Bad namespaceURI for " + got.nodeName
            );
        }
        
        // compare attributes - disregard xmlns given namespace handling above
        var gotAttrLen = 0;
        var gotAttr = {};
        var expAttrLen = 0;
        var expAttr = {};
        var ga, ea, gn, en;
        for(var i=0; i<got.attributes.length; ++i) {
            ga = got.attributes[i];
            if(ga.specified === undefined || ga.specified === true) {
                if(ga.name.split(":").shift() != "xmlns") {
                    gn = testPrefix ? ga.name : ga.name.split(":").pop();
                    gotAttr[gn] = ga;
                    ++gotAttrLen;
                }
            }
        }
        for(var i=0; i<expected.attributes.length; ++i) {
            ea = expected.attributes[i];
            if(ea.specified === undefined || ea.specified === true) {
                if(ea.name.split(":").shift() != "xmlns") {
                    en = testPrefix ? ea.name : ea.name.split(":").pop();
                    expAttr[en] = ea;
                    ++expAttrLen;
                }
            }
        }
        fdoc.el.assertEqual(
            gotAttrLen, expAttrLen,
            "Attributes length mismatch for " + got.nodeName
        );
        var gv, ev;
        for(var name in gotAttr) {
            if(expAttr[name] == undefined) {
                throw "Attribute name " + gotAttr[name].name + " expected for element " + got.nodeName;
            }
            // test attribute namespace
            fdoc.el.assertEqual(
                gotAttr[name].namespaceURI, expAttr[name].namespaceURI,
                "Attribute namespace mismatch for element " +
                got.nodeName + " attribute name " + gotAttr[name].name
            );
            // test attribute value
            fdoc.el.assertEqual(
                gotAttr[name].value, expAttr[name].value,
                "Attribute value mismatch for element " + got.nodeName +
                " attribute name " + gotAttr[name].name
            );
        }
        
        // compare children
        var gotChildNodes = fdoc.el.getChildNodes(got, options);
        var expChildNodes = fdoc.el.getChildNodes(expected, options);

        fdoc.el.assertEqual(
            gotChildNodes.length, expChildNodes.length,
            "Children length mismatch for " + got.nodeName
        );
        for(var j=0; j<gotChildNodes.length; ++j) {
            try {
                fdoc.el.assertElementNodesEqual(
                    gotChildNodes[j], expChildNodes[j], options
                );
            } catch(err) {
                throw "Bad child " + j + " for element " + got.nodeName + ": " + err;
            }
        }
    }
    return true;
};

/**
 * Function fdoc.el.getChildNodes
 * Returns the child nodes of the specified nodes. By default this method
 *     will ignore child text nodes which are made up of whitespace content.
 *     The 'includeWhiteSpace' option is used to control this behaviour.
 * 
 * Parameters:
 * node - {DOMElement}
 * options - {Object} Optional object for test configuration.
 * 
 * Valid options:
 * includeWhiteSpace - {Boolean} Include whitespace only nodes when
 *     comparing child nodes.  Default is false.
 * 
 * Returns:
 * {Array} of {DOMElement}
 */
fdoc.el.getChildNodes = function(node, options) {
    //check whitespace
    if (options && options.includeWhiteSpace) {
        return node.childNodes;
    }
    else {
        nodes = [];
        for(var i=0, len=node.childNodes.length; i < len; ++i) {
            var child = node.childNodes[i];
            if(child.nodeType == 1) {
                //element node, add it 
                nodes.push(child);
            }
            else if(child.nodeType == 3) {
                //text node, add if non empty
                if(child.nodeValue &&
                    child.nodeValue.replace(/^\s*(.*?)\s*$/, "$1") != "" ) {
                    nodes.push(child);
                }
            }
        }
    
        return nodes;
    }
};

/**
 * Function: fdoc.el.eq
 * Test if two XML nodes are equivalent.  Tests for same node types, same
 *     node names, same namespace URI, same attributes, and recursively
 *     tests child nodes for same criteria.
 *
 * (code)
 * t.xml_eq(got, expected, message);
 * (end)
 * 
 * Parameters:
 * got - {DOMElement | String} A DOM node or XML string to test.
 * expected - {DOMElement | String} The expected DOM node or XML string.
 * msg - {String} A message to print with test output.
 * options - {Object} Optional object for configuring test.
 *
 * Valid options:
 * prefix - {Boolean} Compare element and attribute
 *     prefixes (namespace uri always tested).  Default is false.
 * includeWhiteSpace - {Boolean} Include whitespace only nodes when
 *     comparing child nodes.  Default is false.
 */
fdoc.el.eq = function(got, expected, msg, options) {
    var result = {};
    // convert arguments to nodes if string
    if(typeof got == "string") {
        try {
            got = fdoc.el.createNode(got);
        } catch(err) {
            result = {
                pass: false,
                msg: msg + ": got argument could not be converted to an XML node: " + err
            };
            return result;
        }
    }
    if(typeof expected == "string") {
        try {
            expected = fdoc.el.createNode(expected);
        } catch(err) {
            result = {
                pass: false,
                msg: msg + ": expected argument could not be converted to an XML node: " + err
            };
            return result;
        }
    }
    
    // test nodes for equivalence
    try {
        fdoc.el.assertElementNodesEqual(
            fdoc.el.stripClass(got.cloneNode(true)),
            fdoc.el.stripClass(expected.cloneNode(true)),
            options
        );
        result = {
            pass: true,
            msg: msg
        };
    } catch(err) {
        result = {
            pass: false,
            msg: msg + ": " + err
        };
    }
    return result;
};
    
