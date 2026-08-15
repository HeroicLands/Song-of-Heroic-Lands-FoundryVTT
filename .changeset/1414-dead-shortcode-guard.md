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
build step nobody runs locally. A bare `[[Name]]` is still never reported — that is the
long-standing placeholder for worldbuilding notes kept outside this repository, and a
hyphenated _name_ like `[[Grukar-ahk]]` stays a name, since a hyphen only qualifies on
a known type.

What made this awkward is that the same syntax addresses content in a **package this
build does not publish**: `Rules/Bestiary.md` links six setting-package creatures that
are real notes in the vault, resolving in Obsidian and on heroiclands.org but not here.
Nothing distinguishes them from a typo, so they are listed by name in
`FOREIGN_ADDRESS_ALLOWLIST` with the note each one means — six reviewed entries rather
than a blanket tolerance — and the check warns when an entry stops being used. The list
goes away once the tree has a single source (#1385) and every package is visible.
