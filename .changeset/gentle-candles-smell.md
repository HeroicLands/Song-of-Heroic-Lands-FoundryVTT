---
"sohl": minor
---

Define and Initialize Intrinsic Actions Workflow

**Executor wiring.** Intrinsic actions resolve their executor by
case-sensitive method lookup on the scoped logic object at construction
time, throwing when the method is missing. This release fixes the base
`postfinalize` action (its executor string now matches the `postFinalize`
method) and implements the well-defined executors that were declared but
missing:

- `SkillLogic.successTest` / `SkillLogic.opposedTestStart` — delegate to the
  skill's `MasteryLevelModifier`.
- `SkillLogic.setImproveFlag` / `SkillLogic.unsetImproveFlag` — toggle
  `system.improveFlag` via item update.
- `GearLogic.setCarried` / `GearLogic.setNotCarried` — toggle
  `system.isCarried` via item update.

Executors for mechanics that are still roadmap work (e.g. WeaponGear
`attack`/`block`/`counterstrike`, Mystery `useMystery`, MysticalAbility
`perform`, several Affliction/Trauma tests) remain unimplemented; their
classes' unit tests document each gap with a focused `it.todo`.
