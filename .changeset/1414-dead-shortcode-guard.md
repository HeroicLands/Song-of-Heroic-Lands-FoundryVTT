---
"sohl": patch
---

Fail the build on a wikilink that addresses a document which does not exist (#1414).

A qualified `[[type-shortcode]]` names a document by its identity, so one resolving to
nothing is a dead address. It degraded silently: the link kept its label and rendered
as plain text, so the prose still read correctly while the href was simply gone — the
failure mode that hides best. Nothing reported it. `lint:content-links` explicitly
skipped an unresolvable target as "an external reference, not this check's business",
and the knowledgebase build's own guard only ever recognised the legacy `type/slash`
form, which nothing is written in any more.

`lint:content-links` now checks it, so it gates every `npm run lint` rather than a
build step nobody runs locally. A hyphenated _name_ like `[[Grukar-ahk]]` is not
reported as a dead address, since a hyphen only qualifies on a known type — the
finding for a target that is not an address is its own, because the correction is a
different one.

What made this awkward is that the same syntax addresses content in a **package this
build does not publish**: `Rules/Bestiary.md` links six setting-package creatures that
are real notes elsewhere, resolving on heroiclands.org but not here. Nothing
distinguished them from a typo at the time, so they were listed by name with the note
each one means — six reviewed entries rather than a blanket tolerance. The list goes
away once the tree has a single source (#1385) and every package is visible.
