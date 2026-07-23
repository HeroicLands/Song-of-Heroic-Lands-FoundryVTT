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

**Migration (automatic, lossless).** A world migration retires any existing `trait`
documents: descriptive traits are re-created as `trauma` items (`personality` →
`psycond`, `physique` → `physcond`, mapping `intensity` to the target category);
measured traits are dropped (now modeled on the Being). Foundry cannot change a
document's type in place, so the migration creates the replacement and deletes the
original.

Closes #651
