---
"sohl": patch
---

**`publish.site` is a publishing mode rather than a boolean.**
`@heroiclands/package-build` moves from 4.0.0 to 5.0.0 (#1756).

The major reframes how much of a package reaches the web
(HeroicLands/package-build#55). The floor is no longer "nothing": every package
publishes a front page at `/<contentPackage>/`, and the mode says what stands
beneath it — `homepage` publishes that page and nothing else, `content`
publishes it plus every page the content tree compiles to. This repository
publishes the whole knowledgebase, so `publish.site: true` becomes
`publish.site: content`.

Both booleans are _refused_ at config load rather than mapped onto the nearest
mode, naming the mode to write, so the bump and the respelling are one change:
until the value is respelled every `package-build` and `content-build`
invocation fails. That refusal is the point — `false` used to read as _this
package has no web presence_, which now describes no package at all, and a
value silently reinterpreted reads to its author as though it still means what
it said.

`homepage` mode additionally _fences the content surfaces off_: the tree is
never walked for pages, and `site.sections`, `site.trees`, `site.landing` and
`site.backfillSections` emit nothing however they are declared. That is a
licensing property asserted by the code path rather than by an empty
configuration, and it is what the fan-licensed packages ship under. It does not
apply here.

**Nothing this repository emits changes.** `publish.address`,
`publish.manifests` and the whole `site:` block are untouched, so every address
is the one it was. Verified across the bump: `build/packs-json` is
byte-identical (all 3,126 files), the link manifest still carries 2,989 entries
from 1,606 addressable notes, the generated knowledgebase is byte-identical
(1,606 content pages + 46 tree pages + 17 landings), and the rendered site is
byte-identical too (1,705 pages). This is a lockfile-and-configuration change
only.

The major's other half — a `type: homepage` note that compiles to a page rather
than to a compendium document (HeroicLands/package-build#51) — is an authoring
capability, not a migration. No such note is authored here yet, so the build
reports `0 homepage(s)` and the page at `/sohl/` is the one it was.
