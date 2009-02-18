.. _jugl-condition:

jugl:condition
==============

To optionally process attributes on an element and any child elements, use the ``jugl:condition`` attribute.

Syntax::

    argument ::= expression

If the expression evaluates to ``true``, normal processing of any remaining statements will continue.  If the statement evaluates to ``false``, processing of statements stops and the element (and any child elements) are not included in the processed results.

The following markup is an example of the use of ``jugl:condition`` in a template:

.. code-block:: html

    <div id="template_id">
        <div jugl:condition="true">
            <p>This survives.</p>
        </div>
        <div jugl:condition="false">
            <p>This doesn't.</p>
        </div>
    </div>

The processed markup would look like:

.. code-block:: html

    <div id="template_id">
        <div>
            <p>This survives.</p>
        </div>
    </div>
