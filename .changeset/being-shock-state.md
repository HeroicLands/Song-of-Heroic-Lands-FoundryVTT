---
"sohl": minor
---

**Shock-state infrastructure**

A being's **shock state** is now modeled as the Stunned / Incapacitated /
Unconscious / Dead **status effects** — there is no separate persisted field.
`BeingLogic.shockState` reports the highest active shock status as an ascending
severity level (`NONE` 0 … `DEAD` 4), and all transitions go through a single
`setShockState(level)` operation that clears every shock status then applies only
the target's (none for `NONE`), keeping transitions clean in both directions and
repairing any stray multi-status situation. `advanceShockState(steps)` moves from
the current state by N levels (clamped). The ordered model lives in a pure,
Foundry-free `shock.ts`; a new `fvttToggleActorStatus` shim applies the statuses.

Foundation for the trauma / shock / affliction timed effects (blood-loss advance,
injury shock, shock re-tests). Part of #548. Closes #550
