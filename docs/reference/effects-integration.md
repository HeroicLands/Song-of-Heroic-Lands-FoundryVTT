# Effects Integration

> **Audience:** Developers extending Active Effect behavior and UI wiring.

See also: [Modifier Model](./modifier-model.md), [Extension Points](../how-to/extension-points.md), [Security Model](../concepts/security-model.md).

## Core implementation files

- Effect document wrapper: `src/document/effect/foundry/SohlActiveEffect.ts`
- Shared sheet context wiring: `src/core/foundry/SohlDataModel.ts`

## Document and logic layering

### `SohlActiveEffect`

- Extends Foundry `ActiveEffect`.
- Exposes convenience accessors:
    - `logic` → typed `SohlEffectData`
    - `item` → parent item (when effect is item-owned)
    - `actor` → owning actor fallback
- Delegates context-menu entries to logic (`_getContextOptions`).

### `SohlEffectData`

- Extends `SohlLogic` for effect-level logic hooks.
- Current lifecycle methods (`initialize/evaluate/finalize`) are no-op defaults.
- Data model schema includes targeting metadata fields (`targetType`, `targetName`) used by SoHL's extended targeting model.

## SoHL targeting model

Foundry's baseline ActiveEffect model operates on the embedded owner document. SoHL extends this so an Active Effect can target:

- the embedding document itself,
- the owning actor,
- or every item of a given kind on the same actor (optionally narrowed by a {@link sohl.entity.expr.SafeExpression} predicate).

This behavior is driven by two fields on `SohlActiveEffectDataModel`:

- `scope`
    - `"this"` → apply changes to the document where the effect is embedded (item or actor).
    - `"actor"` → apply changes to the owning actor.
    - `<itemKind>` (e.g. `"skill"`, `"trauma"`, `"weapongear"`, etc.) → apply to every item of that kind on the owning actor, filtered by the `test` predicate. **Scope determines the EFFECT_KEY namespace shown in the changes UI**, so the set of available keys is always known ahead of time.
- `test`
    - Optional {@link sohl.entity.expr.SafeExpression}. When `scope` is an item-kind, this predicate narrows the matched items. Variable binding: `item`. Empty `test` matches every item of that kind.

`SohlActiveEffect.targets` returns the resolved set of target documents; `SohlActiveEffect.allApplicableEffects()` (on both `SohlItem` and `SohlActor`) composes own self-targeting effects with effects living elsewhere that target this document (the inbound "pull" side, surfaced via `transferredActiveEffects()`).

## Dispatch lifecycle

SoHL has `transfer: false` for all effects — Foundry's automatic transfer-to-actor is off. Instead, scope-driven targeting routes each effect to the right document at the right time:

- **Actor-owned effects** flow through Foundry's standard `Actor#applyActiveEffects(phase)`, which now consumes SoHL's overridden `allApplicableEffects()`. The actor receives effects scoped `"this"`/`"actor"` from itself plus effects scoped to it from any owned item.
- **Item-owned effects** are SoHL-driven via `SohlItem#applyActiveEffects(phase)`, called from `SohlActor.prepareEmbeddedData` between Phase I (`initialize`) and Phase II (`evaluate`) for each item. Each item receives effects scoped `"this"` from itself plus effects scoped to it from siblings/actor.

`phase` is the standard Foundry change `phase` field on each change entry. Foundry fires `"initial"` after embedded documents and `"final"` after `prepareData`; SoHL fires `"initial"` for items between their own init and evaluate. Authors target a slot by setting `change.phase` accordingly.

## Change-key prefix system

A change `key` may carry one of three composable SoHL prefixes:

| Prefix          | Semantics                                                                                                                                                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mod:<path>`    | Push a `ValueDelta` onto the `ValueModifier` at `<path>` on the target document (paths are doc-rooted, e.g. `mod:logic.score` resolves to `targetDoc.logic.score`). The `change.type` (`add`, `multiply`, `override`, `upgrade`, `downgrade`, `custom`) maps to the corresponding `VALUE_DELTA_OPERATOR`. |
| `sm:<path>`     | For each strike mode on the target weapon matching `change.strikeModePredicate`, set `<path>` on the strike mode (raw assignment). WeaponGear targets only.                                                                                                                                               |
| `mod:sm:<path>` | Composes the above: for each matching strike mode, push a `ValueDelta` onto the `ValueModifier` at `<path>` on that strike mode.                                                                                                                                                                          |

Standard `system.*` keys fall through to Foundry's stock change application unchanged.

### Strike-mode predicate (`strikeModePredicate`)

A SoHL extension on the per-change schema, only consulted when the key matches `^(mod:)?sm:`. It's an optional {@link sohl.entity.expr.SafeExpression} whose variable `sm` binds to each strike mode candidate. Empty predicate matches every strike mode on the weapon. A predicate that throws on one strike mode skips that strike mode only.

```jsonc
// Example: "Honed Edge" — +1 attack and +1 impact on all cutting strike modes
{
    "name": "Honed Edge",
    "transfer": false,
    "system": {
        "scope": "this",
        "test": "",
        "changes": [
            {
                "key": "mod:sm:attack",
                "type": "add",
                "value": "1",
                "phase": "initial",
                "strikeModePredicate": "sm.traits.cutting === true",
            },
            {
                "key": "mod:sm:impact",
                "type": "add",
                "value": "1",
                "phase": "initial",
                "strikeModePredicate": "sm.traits.cutting === true",
            },
        ],
    },
}
```

All SoHL-prefix dispatch happens in `SohlActiveEffect._applyChangeUnguided` (static), so the same logic handles both actor-driven and item-driven application paths.

## Sheet integration

`SohlActiveEffectSheet` defines effect sheet parts and prepares per-tab context:

- `details` tab: scope choices (`this`, `actor`, and every registered item kind), plus the `test` predicate textarea.
- `changes` tab:
    - localized type labels from `ActiveEffect.CHANGE_TYPES` (v14)
    - key choices resolved from the EFFECT_KEY namespace selected by `scope`
    - a conditional `strikeModePredicate` row, shown only when `scope === "weapongear"` and the change key starts with `sm:` or `mod:sm:` (helper: `isSmKey`)

Templates: [templates/effects/details.hbs](../../templates/effects/details.hbs), [templates/effects/changes.hbs](../../templates/effects/changes.hbs).

## Actor/item sheet context exposure

`SohlDataModel.SheetMixin._prepareContext()` exposes:

- `data.effects` (owned effects)
- `data.trxEffects` (transferred, enabled effects)

This is the main bridge for rendering effect state in actor/item sheets.

## Foundry v14 Active Effect specifics

SoHL targets Foundry v14+. The Active Effect API changed significantly from v13:

### Changes system

- Effect changes are in `system.changes` (not the top-level `changes` array).
- Change modes use a string `type` field (`"add"`, `"multiply"`, `"override"`, etc.) — not the numeric `mode` field from v13.
- Use `ActiveEffect.CHANGE_TYPES` for the change type registry (not `CONST.ACTIVE_EFFECT_MODES`).
- Register custom change types via `CONFIG.ActiveEffect.changeTypes`.

### Duration

- Duration uses `duration.value` + `duration.units` (not `duration.seconds`/`rounds`/`turns`).
- Start time uses `start.time` / `start.round` / `start.turn` (not `duration.startTime` etc.).
- Expiry uses `duration.expiry` event name + `duration.expired` boolean.
- Register custom expiry events via `CONFIG.ActiveEffect.expiryEvents`.

### Removed features

- `legacyTransferral` is removed — do not reference it.

### Key rule

When writing effect code, always use the v14 API. Do not use deprecated v13 patterns — they will not work.

## Current boundaries

- There is no single centralized effects→modifiers transformer in one file.
- Effects participate through document prep + logic usage patterns.
- Any cross-cutting effect mechanics should be introduced through explicit logic entry points, not hidden template-side calculations.
- Regex-based targeting should be kept narrow and intentional to avoid accidentally affecting broad item sets.

## Extension guidance

- Add effect logic by extending `SohlEffectData` rather than embedding behavior in sheets.
- Keep `type`, schema fields, and metadata stable for pack compatibility.
- Prefer adding new target/key choices via metadata/constants rather than hardcoding UI-only branches.
- Ensure new effect behavior remains safe when effects are transferred between item/actor contexts.

## SoHL trigger taxonomy

SoHL ships its own dispatcher for document-level subscriptions ([`sohl.events`](./event-queue.md)). The trigger names and context shapes are **identical to Foundry's `CONFIG.ActiveEffect.expiryEvents` vocabulary** so that an Active Effect with `duration.expiry: "turnStart"` and a SoHL subscription on `"turnStart"` are responding to the same moment, in the same shape, with the same data.

### Built-in triggers

| Trigger           | Context fields (alongside `name`)         | Foundry hook driving it |
| ----------------- | ----------------------------------------- | ----------------------- |
| `updateWorldTime` | `worldTime, dt, options?, userId?`        | `updateWorldTime`       |
| `combatStart`     | `combat`                                  | `combatStart`           |
| `combatEnd`       | `combat`                                  | `deleteCombat`          |
| `roundStart`      | `combat, round, skipped`                  | `combatRound` (derived) |
| `roundEnd`        | `combat, round, skipped`                  | `combatRound` (derived) |
| `turnStart`       | `combat, combatant, turn, round, skipped` | `combatTurn` (derived)  |
| `turnEnd`         | `combat, combatant, turn, round, skipped` | `combatTurn` (derived)  |

`roundEnd` / `turnEnd` are synthesised in [`SohlHookBridge`](../../src/core/logic/SohlHookBridge.ts) by tracking the prior state per combat across `combatRound` / `combatTurn` fires.

### Custom triggers

Use `registerSohlTrigger(name, label)` to add a custom trigger name to both Foundry's expiry-event registry (so it appears in the effect-config UI) and SoHL's vocabulary:

```typescript
import {
    registerSohlTrigger,
    fireSohlTrigger,
} from "@src/entity/event/event-trigger";

registerSohlTrigger("sohlInjuryHealed", "SOHL.Trigger.InjuryHealed");
```

Use `fireSohlTrigger(ctx)` to dispatch the trigger — this is the only path that dual-dispatches to both SoHL's queue (`sohl.events.fire`) and Foundry's `ActiveEffect.registry.refresh`, keeping the two systems in sync:

```typescript
await fireSohlTrigger({ name: "sohlInjuryHealed", injury, actor });
```

### Single-entry-point rules

To keep the two dispatchers from drifting:

- **Never call `Hooks.on(...)` for trigger dispatch outside [`SohlHookBridge`](../../src/core/logic/SohlHookBridge.ts).**
- **Never call `ActiveEffect.registry.refresh(...)` for custom triggers outside `fireSohlTrigger`.**
- **Never call `sohl.events.fire(...)` for custom triggers outside `fireSohlTrigger`** — use `fireSohlTrigger` so both consumers receive the event.

Built-in triggers do **not** go through `fireSohlTrigger`: Foundry's own code already calls `registry.refresh(name, ctx)` next to each hook (`client/helpers/time.mjs`, `client/documents/combat.mjs`), so dual-dispatching the built-ins would expire effects twice. `SohlHookBridge` therefore only calls `sohl.events.fire(...)` for built-ins.

See [Event Queue](./event-queue.md) for the subscription model, cascading dispatch on `updateWorldTime`, and loop protection.
