# Assembly Architecture

See also: [Documentation Hub](../README.md), [Nested Items](./nested-items.md), [Type Catalog](../reference/type-catalog.md)

Assemblies are hybrid Actor/Item entities. They exist because Foundry VTT items can only embed within actors, but SoHL needs standalone item trees (items with nested children) to exist outside of a Being, Cohort, Structure, or Vehicle.

## Mental model

An Assembly is conceptually a single Item that happens to have nested children. It uses an Actor document as a container so that Foundry's embedded document system can host the item tree.

- **Actor-like:** Can be placed on scenes as tokens, contains embedded items, has permissions.
- **Item-like:** Represents a single thing. Dropping an Assembly onto another actor transfers its items with nesting preserved, indistinguishable from a direct item drop.

Assemblies are neither actors (in the game-world sense) nor pure items. They occupy a hybrid space, which is why they have their own sidebar tab separate from both Actors and Items.

## Canonical item invariant

An Assembly must always contain at least one embedded item. Exactly one embedded item must have `nestedIn === null` — this is the **canonical item**, the root item that the Assembly represents.

Valid states:
- One or more items, exactly one with `nestedIn === null`

Invalid states (prevented by enforcement, handled gracefully if encountered):
- Zero items (empty Assembly)
- Multiple items with `nestedIn === null`
- Items exist but none have `nestedIn === null`

The canonical item is derived at runtime via `AssemblyLogic.canonicalItem`. There is no persisted field — the invariant makes derivation deterministic.

## Variant invariance

Assemblies do not vary between rule variants. All logic, data model, and sheet classes are defined at the common level in `src/common/actor/Assembly.ts`. No variant-specific overrides exist or should be created.

## Sheet delegation

The Assembly has no sheet of its own. When an Assembly's sheet is opened, it delegates to the canonical item's sheet. If the Assembly is in an invalid state (no canonical item), a fallback Assembly sheet is shown.

## Name synchronization

The Assembly actor's name is always kept in sync with its canonical item's name. The canonical item is the source of truth. When the canonical item's name changes (e.g., via its sheet), the Assembly's name is automatically updated via `_onUpdateDescendantDocuments`.

## Drop behavior

When an Assembly is dropped onto another actor (e.g., a Being), its items are unpacked onto the target actor with nesting relationships preserved. The items are created in dependency order (roots first) with ID remapping to maintain `nestedIn` pointers. The result is indistinguishable from having added the items individually.

## Deletion guard

Items with nested children cannot be deleted (codebase-wide rule). Children must be un-nested or deleted before the parent can be removed. This is enforced via `SohlItem._preDelete` and applies everywhere, not just Assemblies.

## Assembly creation

Assemblies are never created empty. Two creation paths exist:

1. **Assemblies sidebar "Create Assembly" button:** Launches the Create Item workflow. The resulting item becomes the canonical item of a new Assembly named after the item.
2. **Items sidebar context menu:** Right-click a World Item and select "Create Assembly" to create an Assembly containing a copy of that item.

## UI presentation

- **Dedicated sidebar tab:** Assemblies appear in their own "Assemblies" tab, not in the Actors or Items tabs.
- **Filtered from Actors:** The Actors directory excludes Assembly-type actors.
- **Scene tokens:** Assemblies can be placed on scenes as tokens for interactive objects (e.g., a treasure chest).

## Example

A "Broadsword" Assembly might contain:
- A Broadsword WeaponGear item (the canonical item, `nestedIn === null`)
  - Nested MeleeWeaponStrikeModes (Slash, Thrust)
  - A nested MysticalDevice (enchantment)
    - Nested MysticalAbilities (the device's powers)

A "Treasure Chest" Assembly might contain:
- A ContainerGear item (the canonical item)
  - Nested MiscGear items (coins, bandages, rope)
  - Nested ConcoctionGear items (potions)

## Implementation map

### Core classes

All in `src/common/actor/Assembly.ts`:

- `AssemblyLogic` — lifecycle, `canonicalItem` getter, `isValid` check
- `AssemblyDataModel` — schema (inherits from `SohlActorDataModel`, no additional fields)
- `AssemblySheet` — concrete sheet with render delegation to canonical item

### Invariant enforcement

In `src/common/actor/SohlActor.ts`:

- `_preCreateDescendantDocuments` — prevents adding a second root item to an Assembly
- `_onUpdateDescendantDocuments` — syncs Assembly name when canonical item name changes

### Sidebar

In `src/common/apps/AssemblyDirectory.ts`:

- `AssemblyDirectory` — sidebar tab showing only Assembly actors
- `FilteredActorDirectory` — replaces default ActorDirectory, excludes Assemblies
- `registerAssemblySidebar()` — registers both directories and the sidebar tab
- `registerAssemblyContextMenu()` — adds "Create Assembly" to Items directory context menu

### Deletion guard

In `src/common/item/SohlItem.ts`:

- `_preDelete` — prevents deletion of items with nested children (codebase-wide)
