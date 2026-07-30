---
"sohl": minor
---

**Impaired body parts affect a test's mastery level (#568)**

Wire the Injury rules' _Indefinite Impairment_ consequences onto mastery-level
tests, establishing the `impairedByRoles` → effective-mastery link:

- **Unusable part → auto-Critical-Failure.** A grievous injury (or the
  permanent-unusable flag) makes a body part unusable; a test whose governing
  skill/attribute lists any of that part's roles in `impairedByRoles` is forced to a
  Critical Failure regardless of the roll (`unusableRoles()`,
  `testAutoCriticallyFails`, an additive default-off `autoCriticalFail` flag on
  `SuccessTestResult` — the die is still cast for display, then the outcome forced;
  `isCritical` reports `true`).
- **Impaired-but-usable part → −5 / −10.** A part that is injured but still usable
  imposes its −5 (minor) / −10 (serious) penalty on the effective mastery level of
  any dependent test (`impairedRolePenalties()`, `testImpairmentPenalty`), taking
  the worst matching penalty as a labeled mastery-level delta. Unusable parts are
  excluded — they force the auto-CF instead — so the two views never overlap.

Both are computed in `MasteryLevelModifier.successTest` and are strict no-ops for a
test with no `impairedByRoles` or an actor with no impaired parts; a resumed
`priorTestResult` is not penalized twice. Also adds the missing unit coverage for
the prone (−20 melee) penalty on a combat technique's own strike mode, the sibling
of the weapon path shipped with #562.

The strike-mode required-limb (`minParts`) auto-CF / penalty variant (#628) and the
remaining prone clauses need subsystems that do not exist yet and are follow-ups.

Part of #548.

Closes #568
