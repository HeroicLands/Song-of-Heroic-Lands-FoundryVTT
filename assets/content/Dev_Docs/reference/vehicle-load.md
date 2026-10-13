---
shortcode: vehicleload
name: {full: Vehicle Capacity and Load, aliases: []}
type: doc
subType: reference
description: "Informational occupant counts and load totals exposed by Vehicle actors."
tags: [dev-reference]
data: {pack: none}
sohl: {kbcat: devdocs}
---

See also: [[doc-runtimecontracts|Runtime Contracts]], [[doc-vehicleug|Vehicle]]

# Vehicle Capacity and Load

`VehicleData.occupantCapacity` is an authored nonnegative integer person count. `VehicleData.carryingCapacity` is an authored nonnegative total weight in pounds. Both have explicit zero initial values; preparation supplies no invented capacity. Author these schema paths under `sohl.system` on an actor note.

`VehicleLogic.deriveVehicleState()` recomputes these read-only properties during evaluation and after embedded items finalize:

| Property         | Meaning                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `occupantCount`  | Number of distinct resolved Beings represented by the occupants                           |
| `occupantWeight` | Those Beings' body and carried-gear weights, plus referenced Cohorts' directly owned gear |
| `cargoWeight`    | Vehicle-owned effective gear weights multiplied by quantities                             |
| `totalLoad`      | `occupantWeight + cargoWeight`, in pounds                                                 |

The shared `occupancy-state` helpers expand Cohort member references, deduplicate actors by UUID, and stop reference cycles. Unresolved references are excluded from these totals while their sheet rows remain visible. Other actor kinds contribute no person count. Missing, non-finite or negative weights contribute zero. Each gear item's own weight is counted once, including nested contents separately from their container; derived totals retain full precision and are rounded only for display.

The actor-reference observer calls this refresh seam when referenced actors, embedded items, effects or roster entries change. It updates in-memory state and open sheets without persisting derived totals. Removing an occupant removes its reference only, never the actor.

All capacity and load data is informational. Neither exceeded capacities nor heavier loads modify movement, travel, action budgets, crew behavior or boarding eligibility. Crew roles and titles are descriptive metadata, with adjudication left to the GM.
