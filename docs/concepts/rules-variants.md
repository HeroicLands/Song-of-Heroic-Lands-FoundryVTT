# Rules Variants and Extension Mechanisms

SoHL supports rules customization at three levels:

1. **Variants** (full rules-set implementations)
2. **Modules via lifecycle hooks** (external extension points)
3. **Action items** (document-attached executable behaviors)

This lets SoHL share a large common framework while still supporting major and minor rules differences.

See also: [Extension Points (Developer Guide)](../how-to/extension-points.md), [House Rules Cookbook](../how-to/house-rules-cookbook.md), [Lifecycle Hooks](../how-to/lifecycle-hooks.md), [System Class Overrides](../how-to/system-class-overrides.md), and [Creating a Variant Module](../how-to/variant-module.md).

**You are here**

- This page is the canonical conceptual model for choosing between Variants, Modules, and Action items.
- For step-by-step implementation workflow, use [Extension Points (Developer Guide)](../how-to/extension-points.md).

## 1) Variants (parallel code hierarchies)

Variants are full implementations of rules behavior using parallel class hierarchies.

This is intended for **large-scale, internally consistent rulesets** (for example: HarnMaster Kethira vs HarnMaster 3.5 vs HarnMaster Gold), where many interacting mechanics differ but the overall game concept remains similar.

- Shared/base framework lives in `src/core/` and `src/document/`.
- Legendary variant overrides are `Lgnd*` classes co-located in `src/document/*/logic/`.
- MistyIsle is planned as a separate Foundry module.

Runtime selection is implemented in `src/sohl.ts`:

- `SohlSystem.registerVariant(...)` registers available variants.
- World setting `sohl.variant` selects the active variant (`legendary` or `mistyisle`).
- `SohlSystem.selectVariant(...)` activates the selected variant.
- The selected variant contributes its own `CONFIG` (document sheets, result/modifier classes, etc.).

Core variant registry/selection logic is in `src/core/SohlSystem.ts`.

### Constructor dispatch model

At runtime, `globalThis.sohl` points to the selected `SohlSystem` variant instance. Common code can then construct variant-appropriate classes through mapped constructors (for example, `sohl.CONFIG.ImpactModifier`) without hard-coding variant class names or adding factory wrappers.

## 2) Modules and lifecycle hooks

SoHL exposes hook points during document/item lifecycle processing so external modules can extend behavior without patching core files.

Current lifecycle hook calls are emitted from actor embedded-data preparation in `src/document/actor/foundry/SohlActor.ts`:

- `Hooks.callAll("sohl.<itemType>.postInitialize", item, ctx)`
- `Hooks.callAll("sohl.<itemType>.postEvaluate", item, ctx)`
- `Hooks.callAll("sohl.<itemType>.postFinalize", item, ctx)`

Where:

- `<itemType>` is the Foundry item type (for example, `skill`, `trait`, etc.)
- `ctx` is a `SohlActionContext`

These hooks are intended for module-level augmentation of item/actor lifecycle behavior.

### Example: changing all mystical abilities

If you want to alter behavior for all `mysticalability` items, a module is the right mechanism.

- Conceptually, this is a type-level extension ("all spells") rather than a single-document override.
- In current implementation, hooks are emitted at **item-type granularity** (`sohl.mysticalability.postInitialize`).
- If shortcode-specific behavior is needed, branch inside the hook using `item.system.shortcode`.

Module-based extension does **not** require modifying SoHL core files, but it does require building/installing a Foundry module.

## 3) Actions (item-attached executable logic)

SoHL has a first-class `Action` item type (`ITEM_KIND.ACTION`) defined in `src/document/item/logic/ActionLogic.ts`.

Each Action item can define:

- `subType` (intrinsic vs script action)
- `scope` (`self`, `item`, or `actor`)
- `executor` JavaScript/function target
- `trigger` predicate (JavaScript expression/function)
- visibility/group/permission metadata for UI presentation

Execution model:

- `ActionLogic.initialize()` compiles/loads action behavior from action data.
- `ActionLogic.execute(context)` invokes the action.
- Lifecycle-named Action items (for example `"<itemType>.<shortcode>.postFinalize"`) are automatically discovered and run by `SohlActor.prepareEmbeddedData()`.

Lifecycle-triggered Actions run inside SoHL's phased lifecycle (`initialize` → `evaluate` → `finalize`), not a single per-document pass.

Action items are designed to support on-demand invocation through sheet/context-menu wiring and can also be invoked through lifecycle execution paths.

### Example: changing only "Curse"

If you only want to change one spell (for example, the mystical ability with shortcode `curse`), create an Action item named:

- `mysticalability.curse.postInitialize`

with the desired executor code. That code will run after that item's `initialize()` lifecycle stage.

(And before the system advances to the global `evaluate` phase.)

This mechanism is the easiest way to implement **single-item overrides** and can be configured by users directly in data, without writing/installing a module.

## Practical guidance

- Use a **Variant** for broad rules identity changes and parallel type hierarchies.
- Use **Hooks/Modules** for additive behavior that should remain decoupled from system source, especially for type-level or campaign-wide house rules.
- Use **Action items** for document-local scripted or intrinsic behaviors (including lifecycle-specific automation), especially one-off or small-scope house rules.

### Choosing the mechanism

- **Variant:** requires direct SoHL source changes; best for full coherent rule families.
- **Module:** does not require modifying SoHL core, but does require module development and installation.
- **Action item:** no module required; easiest for non-developers; best when you only need to affect one item at a time.

For most table-specific house rules, start with **Action items** (narrow) or a **Module** (broad).

## Dependency direction

- `src/core/` and `src/document/` base classes must remain variant-agnostic.
- Variant `Lgnd*` override classes can depend on base classes.
- Module extensions should prefer hooks and Action items before patching core logic.

## Data model portability invariant

- Data model schemas are shared and must remain variant-agnostic.
- Variants should not override shared persisted data model fields.
- Store variant-specific persisted data in `flags.sohl.<variant>...`.
- Variant logic should treat missing variant flags as normal and provide safe defaults.

This preserves data portability between variants and avoids schema breakage when content is moved across rules families.
