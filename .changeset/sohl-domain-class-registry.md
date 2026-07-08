---
"sohl": minor
---

**Expose constructable domain classes via `sohl.domain`**

Adds a flat, getter-backed `sohl.domain.<ClassName>` registry so macros and
extension modules have a named entry point to `new` or subclass SoHL's
constructable domain classes — modifiers (`ValueModifier`, `ValueDelta`,
`CombatModifier`, `ImpactModifier`, `MasteryLevelModifier`), results
(`TestResult`, `SuccessTestResult`, `OpposedTestResult`, `ImpactResult`,
`AttackResult`, `DefendResult`, `CombatResult`), strike modes (`StrikeModeBase`,
`MeleeStrikeMode`, `MissileStrikeMode`), `SohlAction`, and body modeling
(`BodyStructure`, `BodyPart`, `BodyLocation`).

Each entry is a getter over a backing record, so a future `sohl.domain.register()`
override (planned) is picked up automatically at every access — `new
sohl.domain.ValueModifier(...)` and `class X extends sohl.domain.SuccessTestResult
{}` both work today.

Also repairs the stale `types/sohl-public-api.d.ts` (its re-exports pointed at the
deleted `src/common/*` tree and it documented a non-existent `sohl.classes`) and
adds a macro/module **API Access Map** how-to.

Part of #80. Closes #81.
