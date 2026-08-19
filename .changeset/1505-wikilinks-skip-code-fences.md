---
"sohl": patch
---

**Content: a code block is verbatim, so a wikilink inside one stays as written.**
Wikilink conversion had no idea where code was, so a `[[…]]` in a code sample was
rewritten as a link. Whether it triggered depended on the surrounding literal's
shape — `grid[[0]]` was rewritten while `[[1,2],[3,4]]` survived, the inner `]`
being one the pattern could not cross — so the corruption looked arbitrary. With
the Macro compiler it became load-bearing: a macro's `{#script}` fence renders
into its JournalEntry documentation, so the _documented_ copy of a shipped macro
was corrupted while the executable copy stayed correct.

A shared scanner (`utils/code-fences.mjs`) now reports where code lives, and the
three rewriters consult it: the pack compilers' `convertWikilinks`, the
knowledgebase's `resolveKbWikilinks`, and the `lint:content-links` scan — which
had likewise been reporting links that only existed inside a code sample.

Covered: fenced blocks (backtick and tilde, any fence length, info string
included, closed by end-of-document if never closed), four-space and tab indented
blocks, and inline code spans. An indented block is measured against the
enclosing list item's content column, so a list continuation stays prose. The
fence syntax itself is now stated once and shared with the `dataview` table
expander, which already read fences correctly.

Compiled output is byte-identical for today's content on both surfaces — no link
that used to resolve stopped resolving.

(Closes #1505.)
