---
"sohl": patch
---

Fix two broken references surfaced by auditing what the knowledgebase links.

**Navigation** — the brand nav's _Song of Heroic Lands_ entry pointed at
`/projects/sohl/`, which has never been a published address; the page is
`/projects/song-of-heroic-lands/`, derived from its name. The entry returned a
genuine 404 in production, and since every site renders the same nav, it did so
from the knowledgebase too. The near-miss `/projects/sohl.md/` is a real legacy
address and keeps its redirect — it is simply not what the nav should advertise.
(#1475)

**Mystical Abilities collection** — the `sohl` package's collection note opened
its _Arcane Incantation_ section with a link to a `thalorna` document, which the
`sohl` content tree cannot resolve. It emitted an unresolved-wikilink warning on
every pack build and made a `sohl` page depend on another package. The `sohl`
package ships no arcane incantations, so the section now carries the same
package-scoped query every other section on that page uses.
