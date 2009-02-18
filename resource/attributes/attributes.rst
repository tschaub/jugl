.. _jugl-attributes:

jugl:attributes
===============

The ``jugl:attributes`` attribute is used to add attribute nodes to an element.

Syntax::

    argument ::= attribute_statement [";" attribute_statement]*
    attribute_statement ::= attribute_name expression
    attribute_name ::= Name

.. note::

    To include a semicolon (;) in an expression, it must be escaped by doubling it (;;).

To set a (non-namespaced) attribute on an element, add a ``jugl:attribute`` attribute with the attribute name and an expression that results in the new attribute value.  If an expression evaluates to ``false``, the new attribute will not be set.

The markup below uses ``jugl:attributes`` in a template:

.. code-block:: html

    <div id="template_id">
        <img jugl:attributes="src source; alt description" />
        <p jugl:attributes="class addClass && 'foo'">
            This paragraph will only be given a class name if addClass is true.
        <p>
    </div>

The template could be processed with the following code:

.. code-block:: javascript

    var source = "path/to/image.png";
    var description = "my image";
    var addClass = false;  // if true, the paragraph will get 'foo' class name
    (new jugl.Template("template_id")).process();

The template markup will look like the following after being processed:

.. code-block:: html

    <div id="template_id">
        <img src="path/to/image.png" alt="my image" />
        <p>
            This paragraph will only be given a class name if addClass is true.
        <p>
    </div>

