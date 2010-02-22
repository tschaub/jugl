Jugl Template Library
=====================

Build documents dynamically with simple HTML or XML tags.

The Basics
----------

Jugl is a JavaScript library that can be used to process HTML or XML templates
and build documents based on your JavaScript environment. Jugl supports a
template language that allows dynamic creation of documents. If you know TAL,
you might find it most helpful to jump to the attribute examples. If you have no
idea what TAL is, keep reading.

The markup for a Jugl template looks something like this:

    <p id="template_id" jugl:content="greeting">
        This content will be substituted with the value of the "greeting" variable.
    </p>

To process the template, you might run something like the following code:

    var greeting = "Hello World!";
    var template = new jugl.Template("template_id");
    template.process();

The first line sets up your custom "Hello World!" greeting. The second line
creates a new template out of the markup identified by `"template_id"`. The
third line processes the template in place (all Jugl attributes are processed
and the original markup is modified).

After processing the template, the markup will look something like this:

    <p id="template_id">Hello World!</p>


Note: By default, a template is processed with the context of the global scope.
This generally means that all properties of the `window` object are available
in all Jugl expressions. The `process` method takes additional arguments that
let you provide (among other things) a custom context.

This example uses the `jugl:content` attribute. On its own, it doesn't seem to
provide anything that useful. The utility of Jugl becomes apparent when you
start creating more complex templates using additional attributes. In this case,
the markup for the template consists of a single tag (the `<p>` element). The
value of the `jugl:content` attribute is a simple variable. In general, the
values of Jugl attributes in template markup can be any JavaScript expression.
Some Jugl attributes define a specific syntax for the attribute values. The
examples given on the various attribute documentation pages will help in
understanding how attribute values should be structured.

More
----

In addition to the reading below, some users might find it helpful to read up on
[attribute languages](http://wiki.zope.org/ZPT/AttributeLanguage). Jugl is
more or less an implementation of [TAL](http://wiki.zope.org/ZPT/TALSpecification14) 
for the browser.

See the [attributes](attributes.md) page for information on Jugl attributes
syntax.
