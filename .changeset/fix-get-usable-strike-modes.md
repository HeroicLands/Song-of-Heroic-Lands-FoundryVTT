---
"sohl": patch
---

**Fix #177:** `BeingLogic.getUsableStrikeModes()` now returns the actor's
genuinely usable strike modes so automated attack and counterstrike can
start.

The method body was a `return []` stub, causing `commonAttack` to abort with
"has no usable strike mode" on every automated attack and counterstrike
resume.

The fix composes the two existing collectors:

- **`availableStrikeModes`** — modes whose weapon is held in ≥ `minParts`
  limbs (missile modes additionally gated by `draw ≤ pull`). Already correct;
  now used as the starting set.
- **Range/reach filter** — melee modes require `distanceToTarget ≤ reach.effective`; missile modes require `distanceToTarget ≤ baseRange.effective`.
- **Type gating** — `meleeAllowed`, `directAllowed`, and `volleyAllowed` options prune the result as callers require.
- **Disabled gate** — modes with `attack.disabled` are always excluded.

Unblocks the automated-attack path (#193 RED cases: "automated attack start"
and "Counterstrike resume").
