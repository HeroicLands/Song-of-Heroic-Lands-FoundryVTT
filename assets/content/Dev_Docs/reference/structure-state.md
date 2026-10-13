---
shortcode: structurestate
name: {full: "Structure Health and Capacity"}
type: doc
subType: reference
description: "Structural Health, occupants and advisory capacity state."
tags: [dev-reference]
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Structure Health and Capacity

`StructureData` declares `maxHealth`, `occupantCapacity`, and `cargoCapacity`, each with an explicit zero initial value. `maxHealth` and `occupantCapacity` are nonnegative integers; `cargoCapacity` is a nonnegative weight in pounds. Zero is an authored empty limit, with no invented default Health or capacity. `occupants` is an initially empty array using the existing actor-reference, role and optional title shape.

`StructureLogic.deriveStructureState()` recomputes in-memory state during evaluation and after embedded items finalize. It is also the refresh seam for changes to referenced actors. Preparation never calls `update()` or alters the actor's persisted source.

| Derived field           | Meaning                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| `data.health.max`       | Authored `maxHealth`                                                     |
| `data.health.value`     | `max(0, maxHealth - structuralDamage)`                                   |
| `structuralDamage`      | Sum of effective levels of embedded Trauma items whose subtype is Injury |
| `occupantCount`         | Distinct resolved Beings, expanding Cohort member references             |
| `occupantsOverCapacity` | Occupant count exceeds `occupantCapacity`                                |
| `cargoWeight`           | Effective gear weight times quantity, displayed to a tenth of a pound    |
| `cargoOverCapacity`     | Cargo weight exceeds `cargoCapacity`                                     |

The count expands actual resolved members, deduplicates actor UUIDs, ignores missing references, and guards cycles. The sheet preserves missing occupant rows. Roles and titles are descriptive metadata; there are no crew eligibility checks. All embedded gear logics contribute their own weights once, including container contents.

Health uses the Injury's finalized `level.effective`; the source `levelBase` is the initialization fallback. Fear and other non-Injury Trauma are excluded. No Protection calculation, siege resolution, automatic destruction or repair rule is introduced.

`addOccupant` and `removeOccupant` are explicitly invoked intrinsic actions shared by the sheet controls and macros. Addition validates that the reference resolves to an actor and is not already listed. Removal changes only `system.occupants`; it does not delete the referenced actor. Both capacity warnings are advisory and do not prevent these actions or cargo edits.

For authored actors, place fields under `sohl.system` using their schema paths. See [[doc-structureug|Structure]] for user-facing controls.
