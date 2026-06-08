---
"sohl": patch
---

Expand API reference documentation (TSDoc)

Add accurate TSDoc across high-value public API surfaces so developers building
against SoHL get complete, trustworthy reference docs. This is a comments-only,
non-behavioral effort (no runtime logic, signatures, or data fields change), run
in reviewable batches per the API documentation coverage plan.

**Documented so far (pilot):**

- `domain/result/CombatResult` — the `TacticalAdvantages` members, the
  constructor (parameters and `@throws`), and the `Data` / `Options` /
  `ContextScope` namespace types.
- `domain/result/AttackResult` — the `impact` and `aimBodyPartCode` properties,
  the constructor, the `evaluate` / `testDialog` / `toChat` overrides (each
  documenting only what it adds over the base), and the namespace types.
