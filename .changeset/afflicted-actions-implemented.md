---
"sohl": minor
---

Implement the Affliction intrinsic actions, and move contagion to the receiving character ([#1183](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1183), supersedes [#1126](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1126)).

**Contagion is now the receiving character's roll**

_Contract Disease_ is replaced by a **Contagion Check** / **Contagion Test** pair on the Being. Anyone may post a Contagion Check on anyone — exposure is something the world does to a character — but the test itself is made on the exposed character's own sheet. There is no longer any notion of transmitting an affliction _at_ someone; the check is always on the receiving side.

The Contagion Test dialog asks which affliction (a dropdown keyed by shortcode), a Situational Modifier, a Success Level Modifier, and whether a contracted affliction is recorded on the sheet — that checkbox defaulting from the **Record Trauma** world setting. The roll is against **Contagion Index × Endurance**; failing it catches the affliction. A marginal failure incubates for a full roll of the new **Onset Formula**, a critical failure for half that (rounded down, `0` meaning immediate). Nothing ever offers to schedule another contagion test.

**The affliction's course is now a Check/Test pair**

The hidden `healingCheck` recurrence — which rolled every missed interval in one pass and applied the results unasked — is replaced by **Course Check** (offers, changes nothing) and **Course Test** (rolls once, applies the outcome). One check yields exactly one test. Because each test schedules the next from _the last test's date_ rather than from the moment it was performed, a character who has fallen behind simply has a test already due, and the backlog drains one consent at a time with the illness's original cadence intact.

The Course Test opens the standard test dialog, confirms before touching the character sheet, and posts a result card saying whether the outcome was applied. Defeating an affliction (Healing Rate 6+) now also removes the Weakness Fatigue it inflicted, and a repeated reaction updates the existing fatigue entry instead of stacking a second one.

**Treatment**

New **Request Treatment** and **Treat Affliction** actions, plus **Perform Affliction Treatment** on the Being. A physician's Success Value test proposes a **Course Bonus** from its Success Stars, which the patient accepts; a bonus above zero becomes a visible Active Effect on the affliction rather than a hidden adjustment. Treatment improves the odds on later Course Tests — it does not cure anything.

**New modifiers and effect keys**

`AfflictionLogic` gains **`course`** and **`healing`** ValueModifiers, both based on Healing Rate × Healing Base, with matching `COURSE` (`mod:logic.course`) and `HEALING` (`mod:logic.healing`) effect keys — so Active Effects can now modify what an affliction is tested against.

**Removals**

The unimplemented Affliction actions are gone along with their executors: _Transmit Affliction_, _Contract Test_, _Treatment Test_, _Diagnosis Test_, _Fatigue Test_, _Morale Test_, and _Fear Test_ — several of which threw an uncaught error when clicked. _Course Test_ and _Healing Test_ were stubs of the same kind but are reimplemented rather than removed. The unused `diagnosisBonusBase` field goes with them.

The system is pre-beta, so none of this ships a world migration: there is no released data to preserve.
