jugl:content
============

The `jugl:content` attribute is used to replace the contents of an element with
the result of some expression.

Syntax:

    argument ::= ['structure'] expression


Take a template with the following markup.

    <ul id="template_id">
        <li jugl:content="word">This content will be replaced.</li>
        <li jugl:content="word.toUpperCase()">Any expression is valid.</li>
    </ul>

Process the template with the code below.

    var word = "foo";
    var template = new jugl.Template("template_id");
    template.process();

The markup will now look like:

    <ul id="template_id">
        <li>foo</li>
        <li>FOO</li>
    </ul>

If the result of the JavaScript expression is a string with structured markup
(XML or HTML), preface the expression with the `structure` keyword.
