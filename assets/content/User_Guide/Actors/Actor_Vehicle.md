---
aliases:
    - Vehicle
id: UzvfN3dVTI3CCC2V
type: doc
package: sohl
category: user-guide
name:
    full: "Vehicle"
slug: "actor-vehicle"
folder: sYK1BozT9xFcinXK
---

# What Is a Vehicle?

A Vehicle represents a movable platform — a wagon, ship, boat, or similar
conveyance. Vehicles can carry passengers, cargo, and equipment. They have
their own protection ratings and can sustain damage.

See also: [Structures](user-guide/actor-structure.md)

# When to Use a Vehicle

Use a Vehicle when:

- You need a ship, wagon, cart, or other transport
- The conveyance has game-mechanical properties (capacity, speed, protection)
- You want to track damage to the vehicle separately from its passengers
- Cargo and equipment need to be managed as part of the vehicle

For fixed locations (buildings, walls), use a Structure instead.

# What a Vehicle Contains

A Vehicle can hold:

- **Protection** — hull or body protection ratings
- **Injuries** — damage records
- **Gear** — cargo, equipment, and stores
- **Movement Profiles** — speed and terrain capabilities
- **Affiliations** — ownership
- **Actions** — vehicle-specific procedures
- **Effects** — active effects

# The Vehicle Sheet

The Vehicle sheet has these tabs:

- **Facade** — image and description
- **Gear** — cargo and equipment
- **Actions** — available actions
- **Effects** — active effects

<!-- TODO: Expand with details on vehicle movement, crew requirements,
     passenger capacity, vehicle combat, and boarding actions -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->

# Intrinsic Actions

A Vehicle defines no actions of its own. It carries only the actions every actor
shares:

| Action              | Shortcode           |
| ------------------- | ------------------- |
| Edit                | `editDocument`      |
| Delete              | `deleteDocument`    |
| Make Default Medium | `makeDefaultMedium` |

All three belong to every actor and are described on [[Item_Base|Base Item]],
which covers what each one does, how it is invoked, and what it produces — the
shared document actions are the same wherever they appear.

**Make Default Medium** picks which movement medium an actor is currently moving
in, and it is driven by the star control in the movement table on a
[[Actor_Being|Being]]'s **Profile** tab. The Vehicle sheet has no movement
table, so a vehicle inherits the action without offering a control for it.

The cargo and equipment a vehicle carries are ordinary gear items with actions of
their own — see [[Item_Gear|Gear]] and the page for each kind of gear.
