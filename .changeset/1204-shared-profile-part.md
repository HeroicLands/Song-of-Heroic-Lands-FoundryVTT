---
"sohl": minor
---

**A shared Profile tab for the Cohort, Vehicle, and Structure sheets**

None of the three non-Being actor sheets had a Profile tab, so a vehicle's
movement rates could not be seen or set from its sheet and no non-Being actor
could reach its **dossier** (private description) at all — the field existed on
every actor but only the Being surfaced it.

All three now render a shared Profile part with three sections:

- **Attributes** — the same score grid the Being uses, kept for _every_ actor
  kind. A vehicle or structure normally authors none, in which case the section
  renders empty rather than disappearing, so a world that wants to give a ship a
  Quality or a keep a Condition can.
- **Movement** — the ledger of per-medium travel rates with the star control
  that picks the actor's current medium, plus an **Add Movement Profile**
  control.
- **Biography** — the dossier editor.

Supporting changes:

- New pure `buildMovementRows(profiles, current)` in the actor sheet-parts
  module: the canonical no-movement row first (actors never author one, so
  without it a mover could not be made immobile), then each authored profile,
  with exactly the current medium starred.
- `_onMakeDefaultMedium` and `_onAddMovementProfile` move from the Being sheet
  to `SohlActorSheetBase` and are registered there. Both only ever touched
  base-actor data, so every actor kind can now drive them; the Being sheet
  inherits them unchanged.

The Being keeps its own richer Profile (affiliations and the body-structure
editor besides) and is untouched.
