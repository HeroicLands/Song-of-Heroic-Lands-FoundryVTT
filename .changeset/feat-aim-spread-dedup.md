---
"sohl": patch
---

**Move aim/spread ownership to `ImpactModifier`**

`aimBodyPartCode` and `spread` were duplicated — stored as direct fields on both `AttackResult` and `ImpactResult`, producing the same two values twice in each serialized tree. They now live exclusively on `ImpactModifier` (the weapon capability descriptor), which is the natural owner.

**Changes:**

- `ImpactModifier` — gains `aimBodyPartCode` and `spread` fields; both are serialized in `toJSON()`.
- `AttackResult.aimBodyPartCode` / `.spread` — converted from stored fields to read-through getters (`this.impact.aimBodyPartCode` / `.spread`); removed from `toJSON()`.
- `ImpactResult.aimBodyPartCode` / `.spread` — same conversion (`this.impactModifier.*`); removed from `toJSON()`.
- `CombatResult.rollImpact()` — drops the now-redundant explicit `aimBodyPartCode`/`spread` pass-through; they flow automatically via the shared `ImpactModifier`.
- `buildAttackResult()` — passes `aimBodyPartCode`/`spread` into `impact.clone()` so they are embedded in the modifier from the start.

Closes #207.
