---
"sohl": minor
---

**Unusable body part auto-Critically-Fails a test (#568)**

Wire the Injury rules' consequence that a **grievous injury makes a body part
unusable — tests that rely on it automatically Critically Fail**.

- A being now exposes `unusableRoles()` — the body-part **roles** it cannot use
  (roles of every part made unusable by a grievous injury or the
  permanent-unusable flag).
- A mastery-level test whose governing skill/attribute lists any of those roles in
  its `impairedByRoles` is forced to a **Critical Failure**, regardless of the
  roll. The decision is a Foundry-free helper (`testAutoCriticallyFails`); the
  forcing is an additive, default-off `autoCriticalFail` flag on `SuccessTestResult`
  honored in `evaluate` (the die is still cast for display, then the outcome is
  forced), and `isCritical` reports `true` for it even when the test has no
  critical digits. Computed in `MasteryLevelModifier.successTest` — a strict no-op
  for tests with no `impairedByRoles` or an actor with no unusable parts, so normal
  rolls are unaffected.

This establishes the previously-unwired `impairedByRoles` → effective-mastery link
for the auto-CF case. The corresponding −5/−10 penalties for _impaired-but-usable_
parts, and the strike-mode required-limb (minParts) variant, are follow-ups.

Part of #548. Closes #568.
