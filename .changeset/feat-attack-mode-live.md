---
"sohl": patch
---

**Rehydrate `AttackResult.mode` to a live `StrikeMode`**

`AttackResult.mode` previously held a `StrikeModeBase.PointerData` struct in memory (the wire form), making it unusable at runtime. It now holds the live `StrikeModeBase | undefined`, following the same pointer-on-wire / live-object-in-memory rule already applied to `DefendResult.mode` and `AttackResult.combatant`.

**Changes:**

- `AttackResult.mode` — runtime type changed from `PointerData` to `StrikeModeBase | undefined`; rehydrated via `StrikeModeBase.fromPointerData()` in the constructor. `undefined` when the weapon is absent from the current client (e.g. the defending client).
- `AttackResult._modePointer` — private field retains the original `PointerData` for lossless `toJSON()` serialization.
- `AttackResult.toJSON()` — `mode` is now serialized from `_modePointer` (same shape as before; no wire format change).
- `SohlCombatantLogic` — two `StrikeModeBase.fromPointerData(atkResult.mode)` calls replaced with direct `atkResult.mode` access; the `priorAttackResult.mode` comparison guarded against `undefined`.

Closes #204.
