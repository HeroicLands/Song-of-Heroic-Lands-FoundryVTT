---
"sohl": minor
---

**Remove legacy counterstrike behavior**

A counterstrike shares the **same skill base mastery level** as a normal attack
but carries its **own modifier deltas** (it can be at a circumstantial
disadvantage an attack isn't), so `defense.counterstrike` remains a legitimate,
separate `CombatModifier`. The only legacy here is the **`noCounterstrike`
trait** — there is no such trait; a counterstrike is gated by `noAttack`, since
it *is* an attack.

- **`MeleeStrikeMode`** — the counterstrike defense is now disabled by the
  `noAttack` trait (or its own `defense.counterstrike.disabled` flag), not by a
  `noCounterstrike` trait.
- **Constants / localization** — removed the orphaned `VALUE_DELTA_ID.NOCOUNTERSTRIKE`
  (`"NoCX"`) and its two lang keys (`SOHL.Key.NoCounterstrike`,
  `SOHL.ValueDelta.INFO.NoCX`).
- **`automatedCounterstrikeResume`** — the automated Counterstrike defense now
  rolls the strike mode's `defense.counterstrike` modifier (not its `attack`
  modifier); the best-chance default ranks by it, and modes whose counterstrike
  is independently disabled are excluded.

Gate counterstrike by `noAttack`; remove the dead `noCounterstrike` trait

The `defense.counterstrike` modifier, the `SM_COUNTERSTRIKE` ActiveEffect key,
`TEST_TYPE.COUNTERSTRIKE`, and the assisted **CX** column are all retained.
