# Assembly Architecture

See also: [Documentation Hub](../README.md), [Type Catalog](../reference/type-catalog.md)

Assemblies are Actor containers that hold collections of items. Their primary purpose is to allow grouping related items together for convenient drag-and-drop onto actors.

## Mental model

An Assembly is a container for items. It uses an Actor document so that Foundry's embedded document system can host the items.

- **Actor-like:** Can be placed on scenes as tokens, contains embedded items, has permissions.
- **Container-like:** Holds a set of items that can be transferred as a group to another actor.

A common use case is representing a suit of armor: an Assembly holds all the individual armor pieces, allowing someone to drag and drop the entire set onto an actor at once.

## Variant invariance

Assemblies do not vary between rule variants. All logic, data model, and sheet classes are defined in `src/document/actor/logic/AssemblyLogic.ts` and `src/document/actor/foundry/AssemblyDataModel.ts` / `AssemblySheet.ts`. No variant-specific overrides exist or should be created.

## Drop behavior

When an Assembly is dropped onto another actor (e.g., a Being), its items are unpacked onto the target actor. The result is the same as having added the items individually.

## Example

A "Full Plate Armor" Assembly might contain:
- A Plate Cuirass ArmorGear item
- A Plate Helm ArmorGear item
- Plate Gauntlets ArmorGear item
- Plate Greaves ArmorGear item

A "Treasure Chest" Assembly might contain:
- A ContainerGear item
- MiscGear items (coins, bandages, rope)
- ConcoctionGear items (potions)

## Implementation map

### Core classes

- `AssemblyLogic` — `src/document/actor/logic/AssemblyLogic.ts` — lifecycle logic
- `AssemblyDataModel` — `src/document/actor/foundry/AssemblyDataModel.ts` — schema (inherits from `SohlActorDataModel`, no additional fields)
- `AssemblySheet` — `src/document/actor/foundry/AssemblySheet.ts` — concrete sheet
