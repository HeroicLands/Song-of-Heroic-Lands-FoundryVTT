# Lifecycle Model

> **Audience:** Developers extending actor/item logic, virtual item generation, or lifecycle-triggered Actions.

See also: [Architecture Overview](./architecture.md), [Rules Variants and Extension Mechanisms](./rules-variants.md), [Extension Points](../how-to/extension-points.md).

## Why this matters

Foundry's document preparation model is organized around `prepareData()` and its standard sub-stages (`prepareBaseData`, `prepareEmbeddedData`, `prepareDerivedData`) per document.

SoHL uses those Foundry hooks as scheduling points, but applies a **phase-batched lifecycle** for SoHL logic:

1. `initialize()`
2. `evaluate()`
3. `finalize()`

The critical difference is that SoHL runs these phases in batches across actor + item logic, instead of fully completing one document before moving to the next.

## SoHL phase contract

### 1) `initialize()`

Purpose:

- set initial state for the document logic object,
- create/register virtual items that must exist before item graph freeze.

Assumptions you can make:

- own document data model is available.

Assumptions you must not make:

- sibling items are fully initialized,
- actor-wide cross-item derived state is complete.

### 2) `evaluate()`

Purpose:

- compute first-pass derived values that need the complete item set.

Assumptions you can make:

- all items (including virtual items) have completed `initialize()`,
- the item cache/set is frozen for this preparation run.

Assumptions you should still treat carefully:

- cross-item chains may not yet be fully finalized.

### 3) `finalize()`

Purpose:

- complete cross-item dependencies,
- perform final derived computations and cleanup.

Assumptions you can make:

- initialize/evaluate phases have completed for all relevant objects.

## Concrete scheduling in `SohlActor`

Primary implementation: `src/document/actor/foundry/SohlActor.ts`

- `prepareBaseData()`
    - resets actor caches,
    - runs actor logic `initialize()`.
- `prepareEmbeddedData()`
    - iterates dynamic item set and runs all item `initialize()` calls,
    - freezes/finalizes item cache,
    - runs item `evaluate()` for all items,
    - runs item `finalize()` for all items.
- `prepareDerivedData()`
    - runs actor logic `evaluate()` then actor logic `finalize()`.

This yields the lifecycle barrier semantics used throughout SoHL:

- all item `initialize()` complete before any item `evaluate()`,
- all item `evaluate()` complete before any item `finalize()`.

## Lifecycle hooks and Action items

During item phases, SoHL emits item-type lifecycle hooks and executes lifecycle-named Action items:

- `sohl.<itemType>.postInitialize`
- `sohl.<itemType>.postEvaluate`
- `sohl.<itemType>.postFinalize`

These are phase-local extension points layered on top of the same initialize/evaluate/finalize schedule.

### Hook naming and granularity

- Hook names are item-type specific.
- If you need shortcode-specific behavior, branch in the handler using `item.system.shortcode`.

### Hook payload

Each lifecycle hook is called with:

1. `item` — the current item in that phase,
2. `ctx` — the `SohlActionContext` created for actor lifecycle processing.

### Per-item phase order

Within each item phase loop in `SohlActor.prepareEmbeddedData()`, the order is:

1. run item logic phase method (`initialize`, `evaluate`, or `finalize`),
2. emit matching lifecycle hook (`Hooks.callAll(...)`),
3. execute matching lifecycle-named Action item if present.

So hooks run **before** lifecycle Action execution for the same item and stage.

### Phase-barrier behavior still applies

- Even with hooks, SoHL keeps phase barriers intact:
    - all `postInitialize` activity completes before any `evaluate` loop begins,
    - all `postEvaluate` activity completes before any `finalize` loop begins.
- Hook listeners should still honor phase assumptions (for example, no finalize-only dependency work in `postInitialize`).

### Practical guidance for hook authors

- Keep handlers idempotent where possible (prepare runs can occur multiple times).
- Prefer deterministic mutations and avoid relying on UI state.
- Use narrow in-handler filters (for example on `item.system.shortcode`) to avoid unintended broad effects.

## Implementation guidance

- Put virtual-item creation in `initialize()`.
- Keep `evaluate()` side effects minimal and deterministic.
- Reserve dependency-sensitive final computations for `finalize()`.
- Do not rely on Foundry's default per-document preparation mental model when writing SoHL logic.
