.. _attributes:

Attributes
==========

.. toctree::

    attributes/content
    attributes/replace
    attributes/repeat
    attributes/define
    attributes/attributes
    attributes/condition
    attributes/omit-tag

A single element can contain any combination of attributes, except that the content and replace attributes may not appear together.

When an element has multiple attributes, they are processed in this order:

#. define
#. condition
#. repeat
#. content or replace
#. attributes
#. omit-tag

    
