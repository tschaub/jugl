.. _jugl-define:

jugl:define
===========

The ``jugl:define`` attribute is used to define a variable that will be available in any expressions of all child elements.

Syntax::

    argument ::= define_statement [';' define_statement]* 
    define_statement ::= variable_name expression
    variable_name ::= Name

.. note::

    To include a semicolon (;) in an expression, it must be escaped by doubling it (;;).
    
When you define a variable on an element, it can be accessed in other statements on that element and any child elements it contains.  Variables defined locally will hide any global variables with the same name.

The value of the define variable will be the result of the expression.

The markup below shows how define variables can be accessed in a template.

.. code-block:: html

    <div id="template_id" jugl:define="date Date(); url window.location.href">
        <p>
            Today is <span jugl:replace="date">today's date</span>, and you're
            looking at <span jugl:replace="url">this url</span>.
        </p>
    </div>

Processed with the following code:

.. code-block:: javascript

    (new jugl.Template("template_id")).process();

the markup becomes something like:

.. code-block:: html

    <div id="template_id">
        <p>
            Today is Wed Feb 18 2009 00:15:41 GMT-0700 (MST), and you're
            looking at http://doc.libjs.net/jugl/trunk/.
        </p>
    </div>


