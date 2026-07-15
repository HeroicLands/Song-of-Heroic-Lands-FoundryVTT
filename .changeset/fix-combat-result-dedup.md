---
"sohl": patch
---

**Eliminate the doubled attack/defend payload in `CombatResult.toJSON()`**

`CombatResult.toJSON()` was emitting each nested result twice: once as `sourceTestResult`/`targetTestResult` (inherited from `OpposedTestResult`) and again as `attackResult`/`defendResult` (redundant stored fields). Every combat card's `data-scope` carried four result objects where two were sufficient, roughly doubling the cross-client payload.

**Changes:**

- `attackResult` and `defendResult` are now **read-only getters** that alias `sourceTestResult`/`targetTestResult`; the stored fields are gone.
- The `CombatResult` constructor normalises construction-time aliases (`attackResult`→`sourceTestResult`, `defendResult`→`targetTestResult`) before calling `super()`, so callers may pass either name — including the revival path, which only sees the serialised `sourceTestResult`/`targetTestResult` keys.
- The `toJSON()` override is removed; `OpposedTestResult.toJSON()` already serialises the pair correctly.
- `buildCombatResult` in `SohlCombatantLogic` no longer passes redundant keys.

_Verify: `CombatResult.toJSON()` now contains one attack result and one defend result (not four), and a round-trip via `defaultFromJSON` restores `attackResult === sourceTestResult`._

Closes #203.
