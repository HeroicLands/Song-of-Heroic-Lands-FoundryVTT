---
"sohl": minor
---

**Retire the `trait` item type**

The `trait` item type is removed: its DataModel, Sheet, and Logic classes, its
registration and per-actor logic accessors, its item-kind enum entry and metadata,
its `TRAIT_SUBTYPE` / `TRAIT_INTENSITY` / `TRAIT_EFFECT_KEY` / `TRAIT_CODE` enums,
and its localization keys are all gone. The Being sheet's Profile tab no longer
renders a Traits section (and its `search-traits` filter is removed).

**The trait data was already modeled elsewhere.** Descriptive personality and
physique traits became Trauma conditions in the earlier trauma work; the remaining
_measured_ physical stats are already first-class fields on the Being/actor data
model after the Corpus→Being dissolution — Body Weight (`body.weight`), Move (the
universal `currentMoveMedium` / `movementProfiles` capability), and Size's effects
(`body.reachBase`, `body.bodyScaleBase`), with Carrying Capacity subsumed by the
encumbrance system. The lone descriptive straggler, handedness, is remodeled as
two `physcond` trauma items, **Right Dominance** and **Left Dominance** — a
whole-side (not hand-only) preference; the ambidextrous have neither.

**Legacy documents are flagged, not converted.** Surviving `trait` documents are
**not** auto-migrated. On every GM world-load the system reports each one as an
unrecognized retired type (console error plus a persistent UI notification) and
leaves it untouched — the GM removes it or recreates its data as a
`trauma`/`attribute` by hand. This avoids lossy guesswork about a removed type.

Closes #651
