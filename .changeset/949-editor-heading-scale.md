---
"sohl": minor
---

**Manuscript type scale for prose-editor headings**

The rich-text (ProseMirror) editor on item Description tabs and the Being Façade
appearance field now gives its headings an explicit Manuscript type scale instead
of letting `h1`–`h6` inherit the body serif and the browser's default bold/sizing
(which read as a generic word-processor heading and broke the vellum identity).

A split hierarchy models the page: `h1`–`h2` use the **Cinzel** display face —
echoing the sheet's section rubrics so prose titles read as the same book as the
chrome around them — with `h1` carrying the rubrication-red ink as an illuminated
top level; `h3`–`h6` use **Cormorant Garamond semibold** so subheads stay inside
the running-text family and read as emphasis rather than six competing
inscriptions. Heading levels now step through an even size/spacing scale, and all
colors resolve from `--sohl-color-*` tokens so headings follow the light/dark
swap. Body, blockquote, and code-block styling are unchanged.

Closes #949
