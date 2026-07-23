---
"sohl": minor
---

**Impaired-but-usable body part penalizes a test's mastery level (#568)**

Complete the Injury rules' _Indefinite Impairment_ table: a body part that is
injured but still usable now imposes its **−5** (minor) / **−10** (serious)
penalty on the effective mastery level of any test that depends on it. This is the
numeric counterpart to the already-shipped auto-Critical-Failure for an _unusable_
(grievous) part.

- A being exposes `impairedRolePenalties()` — each body-part **role** it can still
  use but is impaired in, mapped to the worst (most negative) −5/−10 penalty among
  the usable parts carrying that role. Unusable parts are excluded — they force an
  auto-Critical-Failure, not a number — so the two views never overlap.
- A mastery-level test whose governing skill/attribute lists any of those roles in
  its `impairedByRoles` takes the worst matching penalty as a labeled mastery-level
  delta, applied in `MasteryLevelModifier.successTest` right where the auto-CF is
  computed. The decision is a Foundry-free helper (`testImpairmentPenalty`); it is a
  strict no-op for a test with no `impairedByRoles` or an actor with no impaired
  parts, and a resumed `priorTestResult` is not penalized twice.

Also adds the missing unit coverage for the prone (−20 melee) penalty on a combat
technique's own strike mode (`SkillLogic`), the sibling of the weapon path shipped
with #562.

The strike-mode required-limb (`minParts`) auto-CF variant, and the remaining prone
clauses (Engagement-Zone / body-part-selection / Outnumbered interactions and the
quarter-Move cost to rise), remain follow-ups — they need subsystems that do not
exist yet.

Part of #548.

Closes #568
