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

A Vehicle is a **conveyance that carries people** — a wagon, a ship, a boat, a
cart. It is the thing the party travels _on_, and the thing their cargo travels
_in_.

**Its unique capability is its occupants.** A Vehicle is the only actor other than
a [[Actor_Being|Being]] that carries a property of its own, and that property is
the list of who is aboard: each occupant named, with a role — **crew**,
**passenger**, or **draft creature** — and an optional style such as _Bosun_ or
_Helmsman_. An entry may name a single character or a whole
[[Actor_Cohort|Cohort]], which is shorthand for all of that cohort's members
riding along.

That is the question a Vehicle exists to answer: **who is on board, and in what
capacity.** Everything else it does — holding cargo, carrying actions, taking
effects — any actor can do.

Like every actor, a Vehicle carries movement rates for the mediums it can travel
in, so a river barge and a mountain wagon can be given different speeds.

# When to Use a Vehicle

Use a Vehicle when:

- The party travels by ship, wagon, cart, or boat, and it matters who is aboard
- You want the crew and the passengers distinguished, and a captain named
- Cargo and stores should live with the conveyance rather than in someone's pack
- The conveyance has a travel speed of its own

For a fixed place that does not move — a building, a wall, a bridge — use a
[[Actor_Structure|Structure]] instead.

# What a Vehicle Contains

- **Occupants** — who is aboard, each with a role and an optional title.
- **Gear** — cargo, equipment, and stores carried on the vehicle.
- **Movement** — its travel rates, per medium.
- **Actions** — procedures you attach to the vehicle.
- **Effects** — active effects on the vehicle.

# What a Vehicle Does Not Model

A Vehicle is a container and a conveyance, not a creature:

- **No capacity.** There is no cargo limit and no passenger limit. Nothing weighs
  the load or refuses to accept more; how much a wagon can really take is yours to
  judge.
- **No condition of its own.** A Vehicle has no structural integrity, no hit
  points, and no damage model. It cannot be worn down, holed, or wrecked by the
  rules — a ship that catches fire is a matter for narration.
- **No crew effects.** Having a helmsman aboard, or losing one, changes nothing
  mechanically. The roles are there to record who is doing what, not to modify
  anything.

# The Vehicle Sheet

The Vehicle sheet has these tabs:

- **Facade** — image and description
- **Gear** — cargo, equipment, and stores
- **Actions** — available actions
- **Effects** — active effects

All four are the common actor tabs, and they behave exactly as they do on a
[[Actor_Being|Being]]: the Gear tab is the same inventory ledger (a vehicle's
cargo instead of a character's possessions), and the Actions and Effects tabs
are identical. They are documented once, in
[[Understanding_Sheets|Understanding Sheets]] under _Common Actor Tabs_ — see
that page for the columns, controls, and how to add, stow, and remove things.

The one difference: a Being's Gear tab reports carried weight and encumbrance,
because a character is slowed by what it carries. A vehicle is not encumbered
by its cargo, so its Gear tab reports the cargo's total weight alone.

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
