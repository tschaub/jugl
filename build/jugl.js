/*
 * Jugl.js -- JavaScript Template Library
 *
 * Copyright 2007 Tim Schaub
 * Released under the MIT license.  Please see
 * http://svn.tschaub.net/jugl/trunk/license.txt for the full license.
 */
(function(){var c={prefix:"jugl",namespaceURI:"http://namespace.jugl.org/"};var a={};a.object={extend:function(d,f){d=d||{};f=f||{};for(var e in f){d[e]=f[e]}return d},defaults:function(d,f){d=d||{};f=f||{};for(var e in f){if(d[e]===undefined){d[e]=f[e]}}return d}};a.Element=function(d,e){this.template=d;this.node=e;this.scope={};this.scope.repeat={}};a.object.extend(a.Element.prototype,{template:null,node:null,scope:null,clone:function(){var e=this.node.cloneNode(true);e.removeAttribute("id");var d=new a.Element(this.template,e);a.object.extend(d.scope,this.scope);return d},getAttribute:function(d){var f;if(this.node.nodeType===1){if(this.template.usingNS){f=this.node.getAttributeNodeNS(c.namespaceURI,d)}else{f=this.node.getAttributeNode(c.prefix+":"+d)}if(f&&!f.specified){f=false}}var e;if(f){e=new a.Attribute(this,f,d)}else{e=f}return e},setAttribute:function(d,e){this.node.setAttribute(d,e)},removeAttributeNode:function(d){this.node.removeAttributeNode(d.node)},getChildNodes:function(){var f=this.node.childNodes.length;var e=new Array(f);var g;for(var d=0;d<f;++d){g=new a.Element(this.template,this.node.childNodes[d]);g.scope=a.object.extend({},this.scope);e[d]=g}return e},removeChildNodes:function(){while(this.node.hasChildNodes()){this.node.removeChild(this.node.firstChild)}},removeChild:function(d){this.node.removeChild(d.node);return node},removeSelf:function(){this.node.parentNode.removeChild(this.node)},importNode:function(d){if(this.node.ownerDocument&&this.node.ownerDocument.importNode){if(d.node.ownerDocument!==this.node.ownerDocument){d.node=this.node.ownerDocument.importNode(d.node,true)}}},appendChild:function(d){this.importNode(d);this.node.appendChild(d.node)},insertAfter:function(d){this.importNode(d);var f=this.node.parentNode;var e=this.node.nextSibling;if(e){f.insertBefore(d.node,e)}else{f.appendChild(d.node)}},insertBefore:function(d){this.importNode(d);var e=this.node.parentNode;e.insertBefore(d.node,this.node)},process:function(){var e;var n=true;var j=["define","condition","repeat"];for(var k=0,l=j.length;k<l;++k){e=this.getAttribute(j[k]);if(e){n=e.process();if(!n){return}}}var m=this.getAttribute("content");if(m){m.process()}else{var f=this.getAttribute("replace");if(f){f.process()}}var h=this.getAttribute("attributes");if(h){h.process()}if(!m&&!f){this.processChildNodes()}var d=this.getAttribute("omit-tag");if(d){d.process()}var g=this.getAttribute("reflow");if(g){g.process()}},processChildNodes:function(){var f=this.getChildNodes();for(var e=0,d=f.length;e<d;++e){f[e].process()}}});a.request={loadTemplate:function(d,g,f){var e=function(j){var k,i;try{k=j.responseXML;i=new c.Template(k.documentElement)}catch(h){k=document.createElement("div");k.innerHTML=j.responseText;i=new c.Template(k.firstChild)}g.call(f,i)};a.request.loadUrl(d,e)},loadUrl:function(d,g,e){var f=a.request.createXMLHttpRequest();f.open("GET",d);f.onreadystatechange=function(){if(f.readyState===4){g.call(e,f)}};f.send(null)},createXMLHttpRequest:function(){if(typeof XMLHttpRequest!=="undefined"){return new XMLHttpRequest()}else{if(typeof ActiveXObject!=="undefined"){return new ActiveXObject("Microsoft.XMLHTTP")}else{throw new Error("XMLHttpRequest not supported")}}}};a.node={appendChild:function(g,k){var h,j,f,e,d;if(typeof(g)==="string"){h=document.getElementById(g);if(!h){throw Error("Element id not found: "+g)}g=h}if(typeof(k)==="string"){h=document.getElementById(k);if(!h){throw Error("Element id not found: "+k)}k=h}if(k.namespaceURI&&k.xml){j=document.createElement("div");j.innerHTML=k.xml;f=j.childNodes;for(e=0,d=f.length;e<d;++e){g.appendChild(f[e])}}else{if(g.ownerDocument&&g.ownerDocument.importNode&&g.ownerDocument!==k.ownerDocument){k=g.ownerDocument.importNode(k,true)}g.appendChild(k)}return k}};c.Template=function(d){d=d||{};if(typeof d==="string"||(d.nodeType===1)){d={node:d}}if(typeof(d.node)==="string"){d.node=document.getElementById(d.node);if(!d.node){throw Error("Element id not found: "+d.node)}}if(d.node){this.node=d.node;this.loaded=true}else{if(d.url){this.load({url:d.url,callback:d.callback,scope:d.scope})}}};a.object.extend(c.Template.prototype,{node:null,usingNS:false,xhtmlns:"http://www.w3.org/1999/xhtml",xmldom:window.ActiveXObject?new ActiveXObject("Microsoft.XMLDOM"):null,trimSpace:(/^\s*(\w+)\s+(.*?)\s*$/),loaded:false,loading:false,process:function(d){var e,f;if(d&&!d.context&&!d.clone&&!d.string&&!d.parent){d={context:d}}d=a.object.defaults(d,{context:null,clone:false,string:false});if(this.node.getAttributeNodeNS){if(this.node.getAttributeNodeNS(c.xhtmlns,c.prefix)){this.usingNS=true}}e=new a.Element(this,this.node);if(d.clone){e=e.clone()}if(d.context){e.scope=d.context}e.process();if(d.string){if(e.node.innerHTML){f=e.node.innerHTML}else{if(this.xmldom){f=e.node.xml}else{f=(new XMLSerializer).serializeToString(e.node)}}}else{f=e.node;if(d.parent){if(d.clone){f=a.node.appendChild(d.parent,e.node)}else{this.appendTo(d.parent)}}}return f},load:function(e){if(typeof e==="string"){e={url:e}}e=e||{};this.loading=true;var d=function(f){this.node=f.node;this.loading=false;this.loaded=true;if(e.callback){e.callback.apply(e.scope,[f])}};a.request.loadTemplate(e.url,d,this)},appendTo:function(d){this.node=a.node.appendChild(d,this.node);return this}});a.Attribute=function(d,f,e){this.element=d;this.node=f;this.type=e;this.nodeValue=f.nodeValue;this.nodeName=f.nodeName;this.template=d.template};a.object.extend(a.Attribute.prototype,{element:null,node:null,type:null,nodeValue:null,template:null,splitAttributeValue:function(e){e=(e!=null)?e:this.nodeValue;var d=this.template.trimSpace.exec(e);return d&&d.length===3&&[d[1],d[2]]},splitExpressionPrefix:function(){var d=this.splitAttributeValue();if(!d||(d[0]!="structure"&&d[0]!="text")){d=[null,this.nodeValue]}return d},getAttributeValues:function(){return this.nodeValue.replace(/[\t\n]/g,"").replace(/;\s*$/,"").replace(/;;/g,"\t").split(";").join("\n").replace(/\t/g,";").split(/\n/g)},removeSelf:function(){this.element.removeAttributeNode(this)},process:function(){return this.processAttribute[this.type].apply(this,[])},evalInScope:function(e){var d="eval";return window[d]("with(this.element.scope){"+e+"}")},processAttribute:{define:function(){var g,f,e,d=this.getAttributeValues();for(f=0,e=d.length;f<e;++f){g=this.splitAttributeValue(d[f]);this.element.scope[g[0]]=this.evalInScope(g[1])}this.removeSelf();return true},condition:function(){var d=!!(this.evalInScope(this.nodeValue));this.removeSelf();if(!d){this.element.removeSelf()}return d},repeat:function(){var g=this.splitAttributeValue();var m=g[0];var k=this.evalInScope(g[1]);this.removeSelf();if(!(k instanceof Array)){var l=new Array();for(var e in k){l.push(e)}k=l}var j;var d=this.element;var f=k.length;for(var h=0;h<f;++h){j=this.element.clone();j.scope[m]=k[h];j.scope.repeat[m]={index:h,number:h+1,even:!(h%2),odd:!!(h%2),start:(h===0),end:(h===f-1),length:f};d.insertAfter(j);j.process();d=j}this.element.removeSelf();return false},content:function(){var h=this.splitExpressionPrefix();var l=this.evalInScope(h[1]);this.removeSelf();if(h[0]==="structure"){try{this.element.node.innerHTML=l}catch(g){var d=document.createElement("div");d.innerHTML=l;if(this.element.node.xml&&this.template.xmldom){while(this.element.node.firstChild){this.element.node.removeChild(this.element.node.firstChild)}this.template.xmldom.loadXML(d.outerHTML);var f=this.template.xmldom.firstChild.childNodes;for(var j=0,k=f.length;j<k;++j){this.element.node.appendChild(f[j])}}else{this.element.node.innerHTML=d.innerHTML}}}else{var m;if(this.element.node.xml&&this.template.xmldom){m=this.template.xmldom.createTextNode(l)}else{m=document.createTextNode(l)}var e=new a.Element(this.template,m);this.element.removeChildNodes();this.element.appendChild(e)}return true},replace:function(){var g=this.splitExpressionPrefix();var f=this.evalInScope(g[1]);this.removeSelf();if(g[0]==="structure"){var i=document.createElement("div");i.innerHTML=f;if(this.element.node.xml&&this.template.xmldom){this.template.xmldom.loadXML(i.outerHTML);i=this.template.xmldom.firstChild}while(i.firstChild){var h=i.removeChild(i.firstChild);if(this.element.node.ownerDocument&&this.element.node.ownerDocument.importNode){if(h.ownerDocument!=this.element.node.ownerDocument){h=this.element.node.ownerDocument.importNode(h,true)}}this.element.node.parentNode.insertBefore(h,this.element.node)}}else{var e;if(this.element.node.xml&&this.template.xmldom){e=this.template.xmldom.createTextNode(f)}else{e=document.createTextNode(f)}var d=new a.Element(this.template,e);this.element.insertBefore(d)}this.element.removeSelf();return true},attributes:function(){var d=this.getAttributeValues();var j,f,h;for(var g=0,e=d.length;g<e;++g){j=this.splitAttributeValue(d[g]);f=j[0];h=this.evalInScope(j[1]);if(h!==false){this.element.setAttribute(f,h)}}this.removeSelf();return true},"omit-tag":function(){var g=((this.nodeValue==="")||!!(this.evalInScope(this.nodeValue)));this.removeSelf();if(g){var f=this.element.getChildNodes();for(var e=0,d=f.length;e<d;++e){this.element.insertBefore(f[e])}this.element.removeSelf()}},reflow:function(){var d=((this.nodeValue==="")||!!(this.evalInScope(this.nodeValue)));this.removeSelf();if(d){if(this.element.node.outerHTML){this.element.node.outerHTML=this.element.node.outerHTML}else{this.element.node.innerHTML=this.element.node.innerHTML}}}}});var b="jugl";window[b]=c})();