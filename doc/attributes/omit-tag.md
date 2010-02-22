jugl:omit-tag
=============

The `jugl:omit-tag` attribute is used to replace an element with the contents of
that same element. This has the effect of removing start and end tags while
leaving content in place.

Syntax:

    argument ::= [expression]

If the expression evaluates to `true` or if there is no expression provided, the
element will be replaced with its contents. Expressions that evaluate to `false`
will have no effect (the element is left unchanged).

The following markup demonstrates a template that uses the `jugl:omit-tag`
attribute.

    <div id="template_id">
        <blink jugl:omit-tag="">
            This content will not <b>blink</b>.
        </blink>
        <blink jugl:omit-tag="2 + 2 == 5">
            Grade A browsers still support blink.
        </blink>
    </div>

Processed with something like:

    (new jugl.Template("template_id")).process();

The processed markup should look like this:

    <div id="template_id">
        This content will not <b>blink</b>.
        <blink>
            Grade A browsers still support blink.
        </blink>
    </div>
