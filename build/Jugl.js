/**
 * Jugl.js -- JavaScript Template Attribute Language
 * This code is not yet licensed for release or distribution.
 *
 * Copyright 2007 Tim Schaub
 */

/**
 * Contains portions of OpenLayers.js -- OpenLayers Map Viewer Library
 *
 * Copyright 2005-2006 MetaCarta, Inc., released under a modified BSD license.
 * Please see http://svn.openlayers.org/trunk/openlayers/repository-license.txt
 * for the full text of the license.
 */

/**
 * Contains portions of Prototype.js:
 *
 * Prototype JavaScript framework, version 1.4.0
 *  (c) 2005 Sam Stephenson <sam@conio.net>
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://prototype.conio.net/
 */

Jugl={singleFile:true};(function(){var singleFile=(typeof Jugl=="object"&&Jugl.singleFile);Jugl={prefix:"jugl",namespaceURI:"http://jugl.org/ns#",xmlns:null,scriptName:(!singleFile)?"lib/Jugl.js":"Jugl.js",getScriptLocation:function(){var scriptLocation="";var scriptName=Jugl.scriptName;var scripts=document.getElementsByTagName('script');for(var i=0;i<scripts.length;i++){var src=scripts[i].getAttribute('src');if(src){var index=src.lastIndexOf(scriptName);if((index>-1)&&(index+scriptName.length==src.length)){scriptLocation=src.slice(0,-scriptName.length);break;}}}
return scriptLocation;}};if(!singleFile){var jsfiles=new Array("Jugl/Util.js","Jugl/Class.js","Jugl/Node.js","Jugl/Attribute.js","Jugl/Console.js","Jugl/Parser.js");var allScriptTags="";var host=Jugl.getScriptLocation()+"lib/";for(var i=0;i<jsfiles.length;i++){if(/MSIE/.test(navigator.userAgent)||/Safari/.test(navigator.userAgent)){var currentScriptTag="<script src='"+host+jsfiles[i]+"'></script>";allScriptTags+=currentScriptTag;}else{var s=document.createElement("script");s.src=host+jsfiles[i];var h=document.getElementsByTagName("head").length?document.getElementsByTagName("head")[0]:document.body;h.appendChild(s);}}
if(allScriptTags){document.write(allScriptTags);}}})();Jugl.Util=new Object();Jugl.Util.extend=function(destination,source){for(property in source){destination[property]=source[property];}
return destination;};Jugl.Util.indexOf=function(array,obj){for(var i=0;i<array.length;i++){if(array[i]==obj)return i;}
return-1;};Jugl.Class={isPrototype:function(){},create:function(){return function(){if(arguments&&arguments[0]!=Jugl.Class.isPrototype)
this.initialize.apply(this,arguments);}},inherit:function(){var superClass=arguments[0];var proto=new superClass(Jugl.Class.isPrototype);for(var i=1;i<arguments.length;i++){if(typeof arguments[i]=="function"){var mixin=arguments[i];arguments[i]=new mixin(Jugl.Class.isPrototype);}
Jugl.Util.extend(proto,arguments[i]);if((arguments[i].hasOwnProperty&&arguments[i].hasOwnProperty('toString'))||(!arguments[i].hasOwnProperty&&arguments[i].toString)){proto.toString=arguments[i].toString;}}
return proto;}};Jugl.Console={log:function(){},debug:function(){},info:function(){},warn:function(){},error:function(){},assert:function(){},dir:function(){},dirxml:function(){},trace:function(){},group:function(){},groupEnd:function(){},time:function(){},timeEnd:function(){},profile:function(){},profileEnd:function(){},count:function(){}};(function(){if(window.console){var scripts=document.getElementsByTagName("script");for(var i=0;i<scripts.length;++i){if(scripts[i].src.indexOf("firebug.js")!=-1){Jugl.Util.extend(Jugl.Console,console);break;}}}})();Jugl.Attribute=Jugl.Class.create();Jugl.Attribute.prototype={node:null,element:null,type:null,nodeValue:null,parser:null,initialize:function(node,element,type){this.node=node;this.element=element;this.type=type;this.nodeValue=element.nodeValue;this.nodeName=element.nodeName;this.parser=node.parser;},splitAttributeValue:function(value){value=(value!=null)?value:this.nodeValue;var matches=this.parser.regExes.trimSpace.exec(value);var items;if(matches.length==3){items=[matches[1],matches[2]];}
return items;},getAttributeValues:function(){var trimmed=this.nodeValue.replace(/[\t\n]/g,"").replace(/;\s*$/,"");var tabbed=trimmed.replace(/;;/g,"\t");var newlined=tabbed.split(";").join("\n");return newlined.replace(/\t/g,";").split(/\n/g);},removeSelf:function(){this.node.removeAttributeNode(this);},process:function(){return this.processAttribute[this.type].apply(this,[]);},evalInScope:function(str){var expression="with(this.node.scope){"+str+"}";return eval(expression);},processAttribute:{"define":function(){var values=this.getAttributeValues();var pair;for(var i=0;i<values.length;++i){pair=this.splitAttributeValue(values[i]);this.node.scope[pair[0]]=this.evalInScope(pair[1]);}
this.removeSelf();return true;},"condition":function(){var proceed;try{proceed=!!(this.evalInScope(this.nodeValue));}catch(err){var message=err.name+": "+err.message+"\n";message+="attribute: "+this.nodeName;Jugl.Console.error(message);Jugl.Console.dirxml(this.node.element);Jugl.Console.log(this.node.scope);}
this.removeSelf();if(!proceed){this.node.removeSelf();}
return proceed;},"repeat":function(){var pair=this.splitAttributeValue();var key=pair[0];var list=this.evalInScope(pair[1]);this.removeSelf();if(!(list instanceof Array)){var items=new Array();for(var p in list){items.push(p);}
list=items;}
var node;var previousSibling=this.node;var length=list.length;for(var i=0;i<length;++i){node=this.node.clone();node.scope[key]=list[i];node.scope.repeat[key]={index:i,number:i+1,even:!(i%2),odd:!!(i%2),start:(i==0),end:(i==length-1),length:length};previousSibling.insertAfter(node);node.process();previousSibling=node;}
this.node.removeSelf();return false;},"content":function(){var str;try{str=this.evalInScope(this.nodeValue);}catch(err){Jugl.Console.error("Failed to eval in node scope: "+
this.nodeValue);throw err;}
this.removeSelf();var child=new Jugl.Node(this.parser,document.createTextNode(str));this.node.removeChildNodes();this.node.appendChild(child);return true;},"replace":function(){var str;try{str=this.evalInScope(this.nodeValue);}catch(err){Jugl.Console.error("Failed to eval in node scope: "+
this.nodeValue);throw err;}
this.removeSelf();var replacement=new Jugl.Node(this.parser,document.createTextNode(str));this.node.insertBefore(replacement);this.node.removeSelf();return true;},"attributes":function(){var values=this.getAttributeValues();var pair,name,value;for(var i=0;i<values.length;++i){pair=this.splitAttributeValue(values[i]);name=pair[0];value=this.evalInScope(pair[1]);}
this.removeSelf();return false;},"omit-tag":function(){var omit;try{omit=((this.nodeValue=="")||!!(this.evalInScope(this.nodeValue)));}catch(err){Jugl.Console.error("Failed to eval in node scope: "+
this.nodeValue);throw err;}
this.removeSelf();if(omit){var children=this.node.getChildNodes();var child;for(var i=0;i<children.length;++i){this.node.insertBefore(children[i]);}
this.node.removeSelf();}}},CLASS_NAME:"Jugl.Attribute"}
Jugl.Parser=Jugl.Class.create();Jugl.Parser.prototype={usingNS:false,regExes:null,initialize:function(options){this.regExes={trimSpace:(/^\s*(\w+)\s+(.*?)\s*$/)};},process:function(id){var element=document.getElementById(id);if(element.getAttributeNodeNS){if(element.getAttributeNodeNS(Jugl.xmlns,Jugl.prefix)){this.usingNS=true;}}
var node=new Jugl.Node(this,element);try{node.process();}catch(err){Jugl.Console.error("Failed to process "+
element+" node");}},CLASS_NAME:"Jugl.Parser"}
Jugl.Node=Jugl.Class.create();Jugl.Node.prototype={parser:null,element:null,scope:null,initialize:function(parser,element){this.parser=parser;this.element=element;this.scope=new Object();this.scope.repeat=new Object();},clone:function(){var element=this.element.cloneNode(true);var node=new Jugl.Node(this.parser,element);Jugl.Util.extend(node.scope,this.scope);return node;},getAttribute:function(localName){var element;if(this.element.nodeType==1){if(this.parser.usingNS){element=this.element.getAttributeNodeNS(Jugl.namespaceURI,localName);}else{element=this.element.getAttributeNode(Jugl.prefix+":"+
localName);}
if(element&&!element.specified){element=false;}}
var attribute;if(element){attribute=new Jugl.Attribute(this,element,localName);}else{attribute=element;}
return attribute;},removeAttributeNode:function(attribute){this.element.removeAttributeNode(attribute.element);},getChildNodes:function(){var children=[];var node,scope;for(var i=0;i<this.element.childNodes.length;++i){node=new Jugl.Node(this.parser,this.element.childNodes[i]);node.scope=Jugl.Util.extend({},this.scope);children.push(node);}
return children;},removeChildNodes:function(){while(this.element.hasChildNodes()){this.element.removeChild(this.element.firstChild);}},removeChild:function(node){this.element.removeChild(node.element);return node;},removeSelf:function(){this.element.parentNode.removeChild(this.element);},appendChild:function(node){this.element.appendChild(node.element);},insertAfter:function(node){var parent=this.element.parentNode;var sibling=this.element.nextSibling;if(sibling){parent.insertBefore(node.element,sibling);}else{parent.appendChild(node.element);}},insertBefore:function(node){var parent=this.element.parentNode;parent.insertBefore(node.element,this.element);},process:function(){var attribute;var keepProcessing=true;var series=["define","condition","repeat"];for(var i=0;i<series.length;++i){attribute=this.getAttribute(series[i]);if(attribute){try{keepProcessing=attribute.process();}catch(err){Jugl.Console.error("Failed to process "+
series[i]+" attribute");throw err;}
if(!keepProcessing){return;}}}
var content=this.getAttribute("content");if(content){try{content.process();}catch(err){Jugl.Console.error("Failed to process content attribute");throw err;}}else{var replace=this.getAttribute("replace");if(replace){try{replace.process();}catch(err){Jugl.Console.error("Failed to process replace attribute");throw err;}}}
if(!content&&!replace){this.processChildNodes();}
var omit=this.getAttribute("omit-tag");if(omit){try{omit.process();}catch(err){Jugl.Console.error("Failed to process omit-tag attribute");throw err;}}},processChildNodes:function(){var element,child;var children=this.getChildNodes();for(var i=0;i<children.length;++i){try{children[i].process();}catch(err){Jugl.Console.error("Failed to process "+
children[i]+" node");throw err;}}},CLASS_NAME:"Jugl.Node"}