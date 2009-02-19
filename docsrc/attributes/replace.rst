.. _jugl-replace:

jugl:replace
============

The ``jugl:replace`` attribute is used to replace an entire element with the result of some expression.

Syntax::

    argument ::= ['structure'] expression


Take a template with the following markup.

.. code-block:: html

    <p id="template_id">
        <p jugl:replace="text">This entire paragraph will be replaced.</p>
    </p>

Process the template with the code below.

.. code-block:: javascript

    var text = "Some text.  (And some other symbols like < and >.)";
    var template = new jugl.Template("template_id");
    template.process();

The markup will now look like:

.. code-block:: html

    <p id="template_id">
        Some text.  (And some other symbols like &lt; and &gt;.)
    </p>

If the result of the JavaScript expression is a string with structured markup (XML or HTML), preface the expression with the ``structure`` keyword.
