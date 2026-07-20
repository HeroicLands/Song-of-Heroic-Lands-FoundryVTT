---
"sohl": minor
---

**Success tests roll the die, and can run headlessly**

Fixes two latent defects in the success-test path and completes the `skipDialog`
bypass, so timed and automated effects can resolve a test with no user present.

- **`SuccessTestResult.evaluate()` now rolls the d100.** Previously it resolved
  against the constructor's default die — a hardcoded `[99]` — so any success test
  that did not pre-seed a roll (skill tests, disease contraction, and every
  planned timed effect) silently always rolled 99 (a marginal failure). The die is
  now cast during `evaluate()` **unless the caller supplied one** (`data.roll`) —
  fate replaying a prior roll, or the attacker's die reconstructed on the
  defender's client, are resolved untouched. The default die is now unrolled, and
  the "was a die supplied?" decision is recorded from caller intent, not inferred
  from the die's state. The combat pipeline (`AttackResult` / `DefendResult`), which
  already seeds its roll via `buildAttackResult`, is unchanged.

- **`MasteryLevelModifier.successTest` honors `skipDialog`.** The flag was a no-op
  (the dialog always opened). It now bypasses the dialog and takes the situational
  modifier from `context.scope.situationalModifier`, attributes the result to the
  acting `context.speaker` (so `evaluate()`'s owner check passes — a GM-fired event
  owns every actor), and respects `context.noChat` to suppress the result card
  (useful when a timed handler catches up many elapsed checkpoints at once).

Together these let a GM-fired timed handler resolve a test with
`mlMod.successTest(new SohlActionContext({ speaker, skipDialog: true, noChat, scope }))`
— the foundation the trauma / shock / affliction timed effects build on.

Part of #548. Closes #551
