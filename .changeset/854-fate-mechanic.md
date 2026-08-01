---
"sohl": minor
---

**Wire up the Fate mechanic (post-roll success-level bump)**

A player may now spend a Fate Point _after_ a test is rolled to raise that
test's **success level** — the die is never re-rolled. Fate operates below the
`successStarTable` mapping, so it works for any success test.

**Rung-driven, not `isSuccess`.** Consumption and the level bump are keyed on the
Fate test's **matched rung**, fixing the prior hiccup where a critical failure
did not consume a point and the critical-success "keep" branch did:

| Fate test result         | Fate Point | Bump |
| ------------------------ | ---------- | ---- |
| Critical Failure         | −1         | +0   |
| Marginal Failure         | none       | +0   |
| Marginal Success         | −1         | +1   |
| Critical Success — spend | −1         | +2   |
| Critical Success — keep  | none       | +1   |

**Consent model.** The one branching outcome — a critical success — is asked via
a **spend (+2) / keep (+1)** dialog, never auto-picked. When a point is consumed
and more than one eligible Fate Mystery exists, the player picks the source
(auto-picked otherwise, pre-selecting the most-restricted point so flexible
general points are preserved).

**Fate Points live on Mystery items.** `availableFate(skill)` now resolves the
eligible `fate`-subtype Mysteries — general (`assocSkillCode` null) or specific
to the tested skill — that still have a charge (infinite `charges.value === null`
is honored and never decremented). The gate and the "points available" count
derive from summing their charges.

**Cards.** On resolution the original test's card is re-posted with the bumped
success level (its description table re-resolves against the new level), and a
Fate result card names the resolved path (point lost / no effect / +1 / +2 /
retained +1) and the Mystery spent from. The standard test card's Fate button now
carries the original result so a click reconstructs it as
`context.scope.priorTestResult`.

`AttackResult.fateSkillCode` exposes the melee skill behind a strike mode so an
attack's Fate resolves against that skill's `fateMasteryLevel` / `availableFate`.

Closes #854
