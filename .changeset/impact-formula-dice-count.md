---
"sohl": patch
---

**Strike Modes tab: tidier impact formulas.** The Impact column on the WeaponGear
sheet's Strike Modes tab now follows the same dice-count convention as the rest of
the system: a single die drops its redundant count (`d6`, not `1d6`), and a strike
mode with no dice shows just its modifier (`+4`, never `0d6+4`). The sheet and
`ImpactModifier.diceFormula` now share one pure `ImpactModifier.formatDice` helper
instead of duplicating the rule. Closes #775.
