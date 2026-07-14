---
"sohl": patch
---

**Being health: populate `BeingLogic.health` for the header bar**

Resolves #463. `BeingLogic.health` was a declared-but-unpopulated stub, so the
sheet header's health bar always read 0%. It is now a `{ value, max }` pair of
ValueModifiers, derived in `finalize()`:

- `max = endurance × 3` (or a flat 100 when the being has no Endurance).
- `value` starts at `max`, loses `shock × injuryLevel` for each injury (the hit
  location's inherent shock times the injury level), then the **most restrictive
  ceiling** applies before a 0 floor: a body part impaired ≤ −10 → 75% of max, an
  unusable part → 50%, stunned → 25%, incapacitated/unconscious → 10%, dead → 0.

The math is a pure, unit-tested `deriveHealth` helper; `BeingLogic` gathers the
inputs (Endurance, traumas, per-part impairment reusing #464's
`bodyPartImpairment`, and active statuses via a new `fvttActorStatuses`
FoundryHelpers shim). The header now computes its percentage from `value / max`.

The Being user-guide page gains a **Sheet Header** section documenting the health
bar (and the body-part color grid) rules.

Covered by `deriveHealth` unit tests (endurance/injury/ceiling/floor cases),
`BeingLogic` health tests (endurance × 3, the 100 fallback, the status shim), and
a `being-header-health` e2e (non-zero bar for a healthy being; health drops when
an injury is added).
