---
"sohl": patch
---

**Skill sheet: show the Combat Category field for combat skills**

The Skill sheet never rendered a control for the `combatCategory` field, so a
combat skill's weapon/attack category could not be set from the sheet. The
properties template referenced a `weaponGroup` field (plus stray `baseSkill` /
`domain` references) that no longer exists in the schema, so the control emitted
nothing.

The Skill properties tab now renders a **Combat Category** select bound to
`system.combatCategory`, shown only when the skill's `subType` is `combat`, and
drops the dead phantom-field references. Adds the `SOHL.Skill.FIELDS.combatCategory`
label/hint (the stale `weaponGroup` keys are left in place per the stable-key
rule).

Closes #709
