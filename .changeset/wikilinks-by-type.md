---
"sohl": minor
---

**Wikilinks address a note by `type/shortcode`** (#1281)

A qualified wikilink named the target's top-level content **directory**
(`[[Rules/shock]]`); it now names its **type** (`[[doc/shock]]`) — the same
`(type, shortcode)` identity the rest of the system uses, and one already guaranteed
unique tree-wide by `npm run lint:packs`. All 240 authored links were rewritten.

- _A note can be refiled without breaking its inbound links._ Shortcodes are unique per
  type, not per directory, so the directory never contributed to the address.
- _Routing is derived, not enumerated._ A target's pack comes from its type (`doc` →
  journals, `macro` → macros, `character`/`creature` → actors, everything else →
  items) instead of a hand-maintained directory table. A directory missing from that
  table is what made all 43 container-gear notes unlinkable (#1276); that class of bug
  cannot recur.
- _The bare `[[Text]]` shorthand resolves within the source's own **type**._ Neither the
  directory nor the `category` takes any part in resolution. Shortcodes are unique per
  type, but _aliases_ are not: where two notes of one type share a name, the bare form
  is ambiguous and resolves to neither, so 47 such links were rewritten to the full
  `[[type/shortcode|Text]]` form.
- A qualifier that names no content type is now reported as `unknown-type` (was
  `unmapped-tld`).

Every resolved link was verified unchanged: 843 `@UUID` references across the compiled
packs, byte-identical before and after.

Closes #1276.
