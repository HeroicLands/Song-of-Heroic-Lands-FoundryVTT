---
"sohl": minor
---

**Wikilinks address a note by `type/shortcode`** (#1281)

A qualified wikilink named the target's top-level content **directory**
(`[[Rules/shock]]`); it now names its **type** (`[[doc/shock]]`) — the same
`(type, shortcode)` identity the rest of the system uses. All 240 authored links were
rewritten.

- _A note can be refiled without breaking its inbound links._ Shortcodes are unique per
  type, not per directory, so the directory never contributed to the address.
- _Routing is derived, not enumerated._ A target's pack comes from its type (`doc` →
  journals, `macro` → macros, `character`/`creature` → actors, everything else →
  items) instead of a hand-maintained directory table. A directory missing from that
  table is what made all 43 container-gear notes unlinkable (#1276); that class of bug
  cannot recur.
- _The bare `[[Text]]` shorthand is scoped by **section**_ — a note's type, or its
  `category` for prose pages — rather than by directory. Behaviour is unchanged: the
  same two aliases were ambiguous before and after.
- A qualifier that names no content type is now reported as `unknown-type` (was
  `unmapped-tld`).

Closes #1276.
