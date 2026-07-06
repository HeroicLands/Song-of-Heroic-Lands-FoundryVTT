---
"sohl": patch
---

**`isA` guards for item/actor kinds and logic base types**

The `isA(x, key)` guard now accepts item/actor kind values and the logic base
types, so a `x.kind === ITEM_KIND.X` check can be written `isA(x, ITEM_KIND.X)`
with full type narrowing.

- **Kind checks** — `isA(logic, ITEM_KIND.SKILL)` / `isA(logic, ACTOR_KIND.BEING)`
  match on the logic's serializable `.kind` discriminant and narrow to the
  concrete logic type via a new `ActorLogicByKind` map (mirroring the existing
  `ItemLogicByKind`). No Symbol brand is used for kinds — they aren't
  cycle-forced, and a Symbol would only add un-spoofability, which is
  meaningless for a kind.
- **Base-type brands** — `SohlItemLogic`, `SohlActorLogic`, and
  `SohlCombatantLogic` gain Symbol brands (inherited getters on their base
  classes), so `isA(x, "SohlItemLogic")` matches any item logic across the whole
  subtype hierarchy — which a leaf `.kind` string can't express.
- Converted the logic-side kind checks (lineage-parent guards, the
  skill/attribute opposed-test filter, and the weapongear/combattechnique and
  being combat checks) to `isA`. Foundry-document `.type` checks are unchanged.

No behavior change: because each registered kind's logic extends a shared base
(never another registered kind), `isA(x, KIND)` is exactly `x.kind === KIND`.
