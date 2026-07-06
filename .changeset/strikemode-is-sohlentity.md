---
"sohl": patch
---

**`StrikeModeBase` is now a `SohlEntity`**

`StrikeModeBase` — and its `MeleeStrikeMode` / `MissileStrikeMode` subclasses —
now extends `SohlEntity`, bringing the strike-mode family in line with the other
domain entities (results, modifiers, body parts). Its constructor forwards the
owning logic as the entity `parent`, and its `Data` interface extends
`SohlEntity.Data`.

No behavior change: strike modes are still rebuilt from schema data on every
preparation cycle and are not serialized through the kind registry (the
inherited `toJSON` is unused).
