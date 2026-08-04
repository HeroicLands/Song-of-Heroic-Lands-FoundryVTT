---
"sohl": minor
---

**Per-subType Mystical Ability columns, a Chgs/Max cell, and charge consumption on roll**

On the Being sheet's Mysteries tab, each Mystical Ability sub-type now renders
only the columns meaningful to it, and invoking an ability consumes a charge.

- **Per-subType columns.** `Ability`, `EML`, `Chgs/Max`, and `Notes` show for every
  sub-type; `Skill` is hidden for the intrinsic talents (`arcanetalent`,
  `spirittalent`), and `Lvl` shows only where the sub-type has a meaningful power
  level (`shamanicrite`, `spiritpower`, `divineincantation`, `arcaneincantation`,
  `arcanetalent`, `spirittalent`). The column set is data-driven, mirroring the
  Trauma tab's `MYSTICALABILITY_SUBTYPE_COLUMNS`. A sub-type section still appears
  only when at least one item of that sub-type exists.
- **Skill cell.** Shows the associated skill's name, or an `✕` when the ability
  uses its own mastery level instead (the EML falls back to the internal mastery
  level, as before).
- **Chgs/Max cell.** Renders `<charges left>/<max>`; `✕` when the ability does not
  use charges, `∞` for the infinite-remaining or uncapped-maximum states.
- **Charge consumption.** Making an ability's EML roll decrements its charge count
  by one when it uses finite, capped charges. When charges reach 0 the row is
  greyed out and the roll is blocked until the ability is recharged (the row's
  context menu stays available). Consuming a charge is a direct consequence of the
  player's own roll, so it needs no separate confirmation.

Closes #990
