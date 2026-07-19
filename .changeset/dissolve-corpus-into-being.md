---
"sohl": minor
---

**Dissolve the Corpus into the Being; make movement a universal actor capability**

The `corpus` item type is removed. A being's physical body — anatomy (body
structure), weight, reach, and body-scale — now lives directly on the **Being
actor** under `system.body`, derived by a Being-owned `BodyLogic` and exposed as
`being.body` (`being.body.structure` / `.weight` / `.reach` / `.bodyScale` /
`.injuryTable`). No more embedded one-per-being singleton item, `registerCorpus`
back-reference, or `being.corpus.*` cross-document reads.

**Movement** (`currentMoveMedium` + `movementProfiles`, and the derived
`feetPerRound` / `leaguesPerWatch` / `moveProfile`, plus the `makeDefaultMedium`
action) becomes a universal capability on the **base actor** — every actor kind
(Being, Vehicle, Cohort, Structure) inherits it. `MOVEMENT_MEDIUM.NONE` is the
default; a single shared no-movement profile (`NONE_MOVE_PROFILE`) represents an
actor that cannot move, so no actor authors a `NONE` profile of its own. Beings
additionally derive movement's `strengthModifier` / `encumbrance` from `str` and
carried weight.

**Incorporeality** is now an empty body structure (`body.structure.parts` is
empty), replacing the old "no corpus item" model.

The compendium build inlines a reusable **body template** (`type: body`, e.g.
`Human Folk`) into the being's `system.body` + movement fields instead of
embedding a corpus item.

_No data migration:_ there are no live worlds; throwaway worlds are regenerated
from the packs.

Closes #535
