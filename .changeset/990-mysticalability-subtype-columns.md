---
"sohl": minor
---

**Per-subType Mystical Ability columns, a Chgs/Max cell, Spirit Power association, and charge consumption on roll**

On the Being sheet's Mysteries tab, each Mystical Ability sub-type now renders
only the columns meaningful to it, spirit-based rites resolve a Spirit Power, and
invoking an ability consumes a charge.

- **Per-subType columns.** `Ability`, `EML`, `Chgs/Max`, and `Notes` show for every
  sub-type; `Skill` is hidden for the intrinsic talents (`arcanetalent`,
  `spirittalent`), and `Lvl` shows only where the sub-type has a meaningful power
  level (`spiritpower`, `divineincantation`, `arcaneincantation`, `arcanetalent`,
  `spirittalent`). The column set is data-driven, mirroring the Trauma tab's
  `MYSTICALABILITY_SUBTYPE_COLUMNS`. A sub-type section still appears only when at
  least one item of that sub-type exists.
- **Spirit Power association.** `spiritrite` and `spiritaction` are governed by a
  **Spirit Power** rather than a skill: their assoc column is labelled "Spirit
  Power", the shortcode resolves to a SPIRITPOWER Mystical Ability on the actor,
  and the ability's EML is derived from that Spirit Power's mastery level. When no
  valid Spirit Power is associated the row is disabled (greyed, un-rollable).
- **Skill cell.** Shows the associated skill's (or Spirit Power's) name, or an `✕`
  when none is associated.
- **Chgs/Max cell.** Renders `<charges left>/<max>`; `✕` when the ability does not
  use charges, `∞` for the infinite-remaining or uncapped-maximum states.
- **Ritual Action mastery merge.** A `ritualaction` only pulls its ritual skill's
  mastery level into its EML when that skill actually has one (an unlearned
  ritual's mastery level is disabled and no longer seeds the ability).
- **Charge consumption.** Making an ability's EML roll decrements its charge count
  by one when it uses finite, capped charges. When charges reach 0 the row is
  greyed out and the roll is blocked until the ability is recharged (the row's
  context menu stays available). Consuming a charge is a direct consequence of the
  player's own roll, so it needs no separate confirmation.
- **Sub-type rename.** The `divinedevotion` sub-type is renamed to `ritualaction`
  ("Ritual Action"). Pre-beta with no existing worlds, so no migration is required.

Closes #990
