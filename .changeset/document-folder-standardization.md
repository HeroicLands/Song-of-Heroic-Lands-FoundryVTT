---
"sohl": patch
---

**Standardize every document type into `foundry/` + `logic/` folders**

Internal architecture only — no behavior change, but module/extension authors
who import document classes by path are affected.

- Every document type now follows the same layout: Foundry-coupled code
  (document, data model, sheet/config) under `foundry/`, and Foundry-free
  rules under `logic/`. This was applied to `combatant`, `combat`, `token`,
  `scene`, and `effect` (actor/item already followed it). Representative moves:
  `SohlTokenDocument` → `token/foundry/`, `SohlTokenDocumentLogic` →
  `token/logic/`; `SohlActiveEffect` split into `effect/foundry/` (document,
  data model, sheet) + `effect/logic/effect-logic.ts` (pure change-mapping).
- `combat-tracker-hooks` moved to `combat/` and its combatant-config field
  injection split into `combatant/combatant-config-hooks.ts`.
- `CombatantLogic` is now genuinely Foundry-free: its relational/threat/group
  reads go through the combatant data port (`groupId`, `isDefeated`, `statuses`,
  `isHidden`) and `FoundryHelpers` shims rather than the live document; the pure
  `combatant-logic.ts` helpers were folded into it.
- `chat-card-gating` no longer calls `foundry.utils.fromUuidSync` directly (the
  defender resolver is injected), so the whole `chat/` layer is unit-testable.
- Each new `logic/` folder is added to the ESLint Foundry-free boundary zone and
  the purity smoke test, so the separation is enforced rather than assumed.
- Bare `Hooks.on`/`Hooks.once` calls are normalized to the `(Hooks as any)` form
  used elsewhere (sidesteps a `tsc` overload-union complexity limit).
