---
"sohl": minor
---

**Birthsign as a droppable Mystery + Active Effects**

A birthsign is now a **Mystery(OTHER)** item carrying skill **Active Effects**,
rather than a value the system computes for a character. The player attaches the
sign the character was born under; nothing is derived on the character's behalf.

**How it works**

- A birthsign is a mechanically inert `Mystery` of subType `other` whose behaviour
  lives entirely in its Active Effects. Each effect scopes to the `skill` item
  kind and gates on the skill's subType — `itemLogic.data.subType === "<subtype>"`
  — pushing a `mod:logic.masteryLevel` (type `add`) delta onto every matching
  skill, so the sign raises the Effective Mastery Level of the skills it favours
  and lowers those it hinders. This reuses the system's existing Active-Effect and
  modifier primitives; the birthsign carries no bespoke mechanism of its own.
- The twelve **Astrokýklos** signs (Arnos, Bourax, Diplos, …) ship as named,
  foldered items in the **Items** compendium under _Esoteric → Birthsigns_.

**Content**

- New `mystery` content authored with a top-level `effects:` frontmatter array of
  embedded Active Effects — the first hand-authored use of that seam.
