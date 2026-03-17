# NestedItems (Core Architecture)

See also: [Documentation Hub](../README.md), [Architecture Overview](./architecture.md), [Lifecycle Model](./lifecycle-model.md)

Foundry VTT supports Actors embedding Items, but not true Item→Item document embedding.
SoHL models composition using **NestedItems**: ordinary Actor-owned Items linked by a parent pointer.

## Mental model

A nested item is still a normal Item on an Actor. The relationship is represented by data:

- persisted pointer: `system.nestedIn` (parent item ID)
- runtime resolver: `item.nestedIn` (resolved parent `SohlItem`)

This gives SoHL “item trees” without introducing custom document types.

## Why this exists

NestedItems are used for composition-heavy gameplay structures, including:

- weapon gear with strike modes
- containers with contained gear
- armor with nested protection entries
- mystical/device-style composed item bundles

## Core invariants

1. Parent and child must belong to the same Actor context.
2. Child identity (`_id`) is stable and independent of parent display order.
3. Parent/child links persist through reload because link data is stored in item system data.
4. Runtime caches must be rebuilt before relying on whole-actor item traversal.

## Implementation map

### 1) Item-level relationship APIs

Implemented in `src/common/item/SohlItem.ts`:

- `system.nestedIn` schema field (`DocumentIdField`)
- `item.nestedIn` (resolved parent item)
- `item.isNested` (boolean convenience)
- `item.nestedItems(types?)` (child query)
- `item.createNestedItem(data)` (sets `system.nestedIn` automatically)

### 2) Actor-level item graph and lifecycle

Implemented in `src/common/actor/SohlActor.ts`:

- `dynamicAllItems()` iterates embedded + virtual items during initialize phase
- `finalizeItemsCache()` builds immutable pass caches:
    - `allItems`
    - `allItemTypes`
- lifecycle passes (`initialize`, `evaluate`, `finalize`) then run over the full graph

This ordering matters because virtual/nested additions can happen during initialize.

### 3) Logic convenience

Implemented in `src/common/SohlLogic.ts`:

- `logic.nestedIn` forwards to `logic.item?.nestedIn`

This allows item logic classes to reference their parent container directly.

## Lifecycle interaction details

NestedItems are not “special-cased” as a different document class; they participate in standard item lifecycle processing after graph expansion.

Practical effect:

- if logic creates virtual/nested items during initialize, they are picked up before cache finalization
- evaluate/finalize phases then run against the finalized graph

## UI and drag/drop behavior

`SohlItemSheetBase` contains move/sort/drop handling that enforces practical constraints (for example, preventing obvious self-container loops and handling sibling sort operations).

Treat sheet-level move logic as part of the nested-item integrity boundary.

## Deletion guard

An item with nested children cannot be deleted. Children must be un-nested or deleted before the parent can be removed. This is enforced via `SohlItem._preDelete` and applies codebase-wide.

This prevents orphaned items with dangling `nestedIn` pointers.

## Assembly as item container

An Assembly actor exists to host standalone nested item trees outside of a Being, Cohort, Structure, or Vehicle. The Assembly is conceptually a single Item with children — it uses an Actor document as the container because Foundry requires items to embed within actors.

See [Assembly Architecture](./assembly-architecture.md) for full details.

## Variant interaction

NestedItems machinery is variant-agnostic.

- `src/common/*` owns relationship mechanics.
- variants decide which item structures exist and how they are evaluated.
