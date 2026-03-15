# Effects Integration

> **Audience:** Developers extending Active Effect behavior and UI wiring.

See also: [Modifier Model](./modifier-model.md), [Extension Points](../how-to/extension-points.md).

## Core implementation files

- Effect document wrapper: `src/common/effect/SohlActiveEffect.ts`
- Effect logic + data model: `src/common/effect/SohlEffectData.ts`
- Effect sheet config: `src/common/effect/SohlActiveEffectConfig.ts`
- Shared sheet context wiring: `src/common/SohlDataModel.ts`

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

## SoHL extended targeting model

Foundry's baseline ActiveEffect model operates on the embedded owner document. SoHL extends this so an Active Effect can target:

- the embedding document itself,
- the owning actor,
- or other embedded items on the same actor.

This behavior is driven by two effect fields:

- `targetType`
    - `"this"` → apply changes to the document where the effect is embedded.
    - `"actor"` → apply changes to the owning actor data model.
    - `<itemType>` (for example `skill`, `trait`, `weapongear`, etc.) → apply to matching items of that item document type on the same actor.
- `targetName`
    - used for item-type targeting,
    - interpreted as a regular expression,
    - matched against candidate item shortcodes (items with matching type and shortcode are affected).

This is the key mechanism that enables cross-item and item-to-actor effect propagation.

## Sheet integration

`SohlActiveEffectConfig` defines effect sheet parts and prepares per-tab context:

- `details` tab: target type choices (`this`, `actor`, and item types)
- `changes` tab:
    - localized mode labels from `CONST.ACTIVE_EFFECT_MODES`
    - key choices resolved from item metadata when available

The `details` UI is where `targetType`/`targetName` are authored for cross-document targeting behavior.

Templates are under `templates/effects/*`.

## Actor/item sheet context exposure

`SohlDataModel.SheetMixin._prepareContext()` exposes:

- `data.effects` (owned effects)
- `data.trxEffects` (transferred, enabled effects)

This is the main bridge for rendering effect state in actor/item sheets.

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
