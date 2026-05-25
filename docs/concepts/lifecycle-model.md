# Lifecycle Model

> **Audience:** Developers extending actor/item logic or lifecycle-triggered Actions.

See also: [Architecture Overview](./architecture.md), [Extension Points](../how-to/extension-points.md).

## Why this matters — the problem with Foundry's default lifecycle

Foundry VTT prepares each document through three stages: `prepareBaseData()` → `prepareEmbeddedData()` → `prepareDerivedData()`. During `prepareEmbeddedData()`, Foundry calls the **full** `prepareData()` chain on each embedded item **one at a time** — each item is completely prepared before the next item starts.

This creates a fundamental problem for SoHL: **items cannot depend on sibling items**.

Consider a Skill whose mastery level depends on trait attributes (Strength, Dexterity, Aura). Under Foundry's default behavior, if the Skill is processed before those Traits, the trait values aren't available yet. There is no ordering guarantee for sibling items, so code cannot rely on any other item having been prepared.

SoHL solves this with a **phase-batched lifecycle**. Instead of fully preparing each item sequentially, SoHL overrides `prepareEmbeddedData()` to run three phases across **all** items:

1. **`initialize()`** — called on every item first
2. **`evaluate()`** — called on every item after all have initialized
3. **`finalize()`** — called on every item after all have evaluated

This gives cross-item phase barriers: when any item's `evaluate()` runs, it can rely on every sibling item (including those Traits) having completed `initialize()`. When any item's `finalize()` runs, every sibling has completed `evaluate()`.

These method names are deliberately different from Foundry's `prepareBaseData`/`prepareDerivedData` to signal that **they follow different ordering rules**. Calling them by Foundry's names would imply per-document sequential preparation, which is not how SoHL invokes them.

## SoHL phase contract

### 1) `initialize()`

Purpose:

- Set initial state for the document logic object (create ValueModifiers, set base values from persisted data).

What you can rely on:

- Your own document's persisted data model fields are available.

What you cannot rely on:

- Sibling items being initialized — another Skill or Trait on the same actor may not have run `initialize()` yet.
- Any cross-item derived state.

**Example:** A Skill creates its `MasteryLevelModifier` and `SkillBase` objects, setting base values from persisted fields. It does NOT yet read trait attribute values.

### 2) `evaluate()`

Purpose:

- Compute derived values that depend on sibling items being initialized.
- Resolve references to other items on the same actor.

What you can rely on:

- **All** items on the actor have completed `initialize()`.
- The item set is frozen for this preparation run.

What you cannot rely on:

- Other items having completed `evaluate()` — cross-item chains that depend on evaluated state belong in `finalize()`.

**Example:** A Skill reads trait attribute values (which were set up during those traits' `initialize()`) to compute its skill base. A gear item resolves its `containerId` to find its parent container.

### 3) `finalize()`

Purpose:

- Resolve cross-item dependencies that require all items to have evaluated.
- Perform final derived computations and cleanup.

What you can rely on:

- **All** items have completed both `initialize()` and `evaluate()`.

**Example:** Fate mastery level calculation, which depends on Aura (a trait that must have been evaluated first). Final encumbrance totals that sum across all evaluated gear items.

## Concrete scheduling in `SohlActor`

Primary implementation: `src/document/actor/foundry/SohlActor.ts`

### How Foundry calls it vs. what SoHL does

```
Foundry calls:                  SoHL implements:
─────────────                   ────────────────
prepareBaseData()          →    actor.logic.initialize()
                                reset caches

prepareEmbeddedData()      →    ┌─ for each item: item.logic.initialize()    ← PHASE 1
                                │  ════════ barrier ════════
                                ├─ for each item: item.logic.evaluate()      ← PHASE 2
                                │  ════════ barrier ════════
                                └─ for each item: item.logic.finalize()      ← PHASE 3

prepareDerivedData()       →    actor.logic.evaluate()
                                actor.logic.finalize()
```

The key is `prepareEmbeddedData()`: instead of letting Foundry call each item's full `prepareData()` chain sequentially, SoHL overrides it to batch items through three phases with barriers between them.

This yields the lifecycle barrier semantics used throughout SoHL:

- **All** item `initialize()` calls complete before **any** item `evaluate()` runs.
- **All** item `evaluate()` calls complete before **any** item `finalize()` runs.

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

- Put base value setup in `initialize()`. Do not read sibling items here.
- Put cross-item reads in `evaluate()` — this is where you can safely access other items' initialized state (e.g., reading trait values for a skill base formula).
- Reserve dependency-sensitive final computations for `finalize()` — anything that depends on sibling items having been evaluated.
- Keep all phases idempotent and side-effect-free (no database writes). `prepareData` can be called multiple times.
- **Do not use Foundry's `prepareBaseData`/`prepareDerivedData` on items.** SoHL bypasses Foundry's per-item preparation in favor of the batched lifecycle. Implement `initialize()`/`evaluate()`/`finalize()` on your Logic class instead.
