---
"sohl": minor
---

**Active Effects: strike-mode scopes replace the `sm:` key mechanism**

Active Effects can now target strike modes directly with two new `scope`
values, `meleestrikemode` and `missilestrikemode`. When an effect uses one, the
`test` predicate is run against every strike mode of that type across the
actor's items — bound `itemLogic` (the owning item's logic) and `sm` (the strike
mode) — and each matching strike mode receives the change. This lets an effect
raise, say, attack rolls (`mod:attack`) without touching the underlying `melee`
skill, optionally narrowed to specific items or strike modes via the predicate.

- **Predicates now bind logic, not documents.** Item-kind-scoped predicates bind
  `itemLogic` (was the `item` document); strike-mode-scoped predicates bind
  `itemLogic` + `sm`.
- **New effect-key sets** `MELEESTRIKEMODE_EFFECT_KEY` (attack, impact, reach,
  block, counterstrike) and `MISSILESTRIKEMODE_EFFECT_KEY` (attack, impact,
  spread, base range, draw); the change-key dropdown is populated for the
  strike-mode scopes.
- **Removed** the per-change `strikeModePredicate` field and the `sm:` /
  `mod:sm:` key-prefix routing (superseded by scope + `test`), along with the old
  `WeaponGear.EffectKey.SM_*` keys and the `isSmKey` helper.

No migration is provided (no released worlds depend on the old mechanism).
