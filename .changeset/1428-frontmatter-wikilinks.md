---
"sohl": patch
---

Refuse a wikilink authored inside a frontmatter value (#1428).

Both content builds walk a note's **body** and copy its frontmatter through verbatim,
so a `[[…]]` written in a `description`, a `government.summary`, or any other
prose-bearing field is never resolved. It reaches the reader as literal brackets, in
whatever the theme renders that field as — an infobox row, a card subtitle — and
nothing downstream notices, because the value is a perfectly good string. The page
builds, the link checks are body-only, and the defect is visible solely to someone who
looks at the rendered field.

`lint:content-links` now reports every one and fails, naming the file, the dotted key
path, and the link as written; `build-kb-content` refuses the same thing before it
writes a single page, so the form cannot publish even if the lint is bypassed.

The form is refused rather than resolved on purpose. Resolving it would mean choosing
an output syntax for a field whose renderer this build does not know — a markdown link
is inert in a template that prints the value as text, and an `<a>` is unusable in one
that escapes it — and it would bless an authoring habit the pack compilers have no way
to honour at all. Frontmatter carries data; a link belongs in the prose the field
summarises.

Values are read from the _parsed_ frontmatter, so a `[[` inside a YAML comment is not a
hit, nested maps and lists are walked, and every hit can be pointed at by the path an
author would look for.
