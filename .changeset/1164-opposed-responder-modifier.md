---
"sohl": patch
---

**The responder's side of an opposed test rolls its own mastery level**

Answering a contest with **Respond** measured the defender's d100 against an
**empty** mastery-level modifier instead of the skill or attribute they picked,
so a contest could not be won on the defender's own competence — the chosen
skill's Mastery Level never reached the roll.

`MasteryLevelModifier.opposedTestResume` branched on
`if (!opposedTestResult.targetTestResult)`, but the `OpposedTestResult`
constructor **always** materializes a placeholder target side from the target
token, so that condition was never true. Every Respond fell through to the
branch meant for re-editing a settled contest, which reused the placeholder —
carrying a default, empty modifier — and drove it with the **source's** mastery
level, crossing the two sides.

- **The discriminator is now "has the target side actually rolled?"** — a new
  `SimpleRoll.isRolled`, since an unrolled die is otherwise indistinguishable
  from a rolled one (both report a `total`). A pending side is rolled fresh; an
  already-rolled one is reused untouched, so resuming a settled contest still
  never re-rolls.
- **Both paths run against the responder's own modifier** (`this` — the mastery
  level of the skill or attribute the defender chose), and the fresh result is
  parented to the responder's item, so the result card names that skill and its
  effective mastery level rather than the initiator's.
- **The Additional Modifier from the Respond dialog is honored.** It was
  hard-coded away as `situationalModifier: 0`; it now carries into the roll
  dialog as its Situational Modifier.
- **The contest's target token carries over** to the freshly rolled side, via a
  new `tokenUuid` on the success-test scope, so the result card still names the
  defender.
- The target's card is now posted under the **responder's** speaker rather than
  the initiator's.

The user guide's Respond-dialog description is updated to say that the
Additional Modifier pre-fills the roll dialog that follows.

Closes #1164
