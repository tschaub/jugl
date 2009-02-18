.. _jugl-repeat:

jugl:repeat
===========

The ``jugl:repeat`` attribute is used to duplicate an element for every item in a sequence.

Syntax::

    argument ::= variable_name expression
    variable_name ::= Name

Given an array or other object to use as a sequence, ``jugl:repeat`` statements will replicate an element (and all child elements) for each item in the sequence.  When an array is used as the expression, the ``variable_name`` will be set to the value of each item in the array (not to the array indices).  When an object is used as the expression, the ``variable_name`` will be set to each property name (or key) in the object (and not the property value).

In addition to having access to the ``variable_name``, the element containing the attribute and all child elements will have access to a special repeat variable.  The repeat variable is an object available to the element with the ``jugl:repeat`` attribute and all child elements.  This object is given a property for each ``variable_name`` - in the case of nested repeat statements, the object will have multiple properties.  These named properties are themselves objects, each with special properties that provide access to information about the iteration.

Properties accessible within repeat statements:

* index - repetition number, starting from zero.
* number - repetition number, starting from one.
* even - ``true`` for even-indexed repetitions (0, 2, 4, ...).
* odd - ``true`` for odd-indexed repetitions (1, 3, 5, ...).
* start - ``true`` for the starting repetition (index 0).
* end - ``true`` for the ending, or final, repetition.
* length - length of the sequence, which will be the total number of repetitions.

The following markup creates a template that uses several ``jugl:repeat`` statements:

.. code-block:: html

    <div id="template_id">
        <ul>
            <li jugl:repeat="item tasks" jugl:content="repeat.item.number + ': ' + item">
                This will get replaced by something like '#: task'.
            </li>
        </ul>
        <p>
            Statements about my dog:
            <span jugl:repeat="trait dog" jugl:content="'Her ' + trait + ' is ' + dog[trait] '.'">
                a statement here
            </span>
        </p>
        <table>
            <tr jugl:repeat="row data">
                <td jugl:repeat="col data[repeat.row.index]"
                    jugl:content="data[row][col]"
                    jugl:attributes="class repeat.row.odd ? 'oddrow' : 'evenrow'">
                    cell contents get written here
                </td>
            </tr>
        </table>
    </div>

The above template could be processed with the following code:

.. code-block:: javascript

    var tasks = ["work", "play", "sleep"];
    var dog = {bark: "loud", color: "black"};
    
    var data = [
        ["r1c1", "r1c2"],
        ["r2c1", "r2c2"]
    ];
    
    (new jugl.Template("template_id")).process();


And the processed template would look like this:

.. code-block:: html

    <div id="template_id">
        <ul>
            <li>1: work</li>
            <li>2: play</li>
            <li>3: sleep</li>
        </ul>
        <p>
            Statements about my dog:
            <span>
                Her bark is loud.
            </span>
            <span>
                Her color is black.
            </span>
        </p>
        <table>
            <tr>
                <td class="oddrow">
                    r1c1
                </td>
                <td class="oddrow">
                    r1c2
                </td>
            </tr>
            <tr>
                <td class="evenrow">
                    r2c1
                </td>
                <td class="evenrow">
                    r2c2
                </td>
            </tr>
        </table>
    </div>
