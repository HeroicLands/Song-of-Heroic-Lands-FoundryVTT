---
aliases:
    - Structure
id: STezcXhJMlmYv9XT
type: doc
package: sohl
category: user-guide
name:
    full: "Structure"
slug: "actor-structure"
folder: sYK1BozT9xFcinXK
---

# What Is a Structure?

A Structure represents a fixed installation or location — a building,
fortification, bridge, wall, or other permanent construction. Structures
can be damaged, have protective ratings, and may belong to factions or
organizations.

See also: [Vehicles](user-guide/actor-vehicle.md)

# When to Use a Structure

Use a Structure when:

- You need to track a building's condition (hit points, damage)
- A fortification or wall is part of a siege or combat encounter
- A location has game-mechanical properties (protection, capacity)
- You want to represent ownership or affiliation for a fixed location

For movable platforms (ships, wagons), use a Vehicle instead.

# What a Structure Contains

A Structure can hold:

- **Protection** — defensive ratings for walls, doors, etc.
- **Injuries** — structural damage records
- **Gear** — stored equipment and contents
- **Affiliations** — ownership and factional ties
- **Actions** — structure-specific procedures
- **Effects** — active effects (wards, enchantments, etc.)

# The Structure Sheet

The Structure sheet has these tabs:

- **Facade** — image and description
- **Gear** — stored contents and equipment
- **Actions** — available actions
- **Effects** — active effects

All four are the common actor tabs, and they behave exactly as they do on a
[[Actor_Being|Being]]: the Gear tab is the same inventory ledger (a structure's
stores instead of a character's possessions), and the Actions and Effects tabs
are identical. They are documented once, in
[[Understanding_Sheets|Understanding Sheets]] under _Common Actor Tabs_ — see
that page for the columns, controls, and how to add, stow, and remove things.

The one difference: a Being's Gear tab reports carried weight and encumbrance,
because a character is slowed by what it carries. A structure does not move, so
its Gear tab reports the total weight of its contents alone.

<!-- TODO: Expand with details on how structure damage works, protection
     ratings, siege mechanics, and placing structures on scenes -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->

# Intrinsic Actions

A Structure defines no actions of its own. It carries only the actions every
actor shares:

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
[[Actor_Being|Being]]'s **Profile** tab. A structure does not move and its sheet
has no movement table, so it inherits the action without offering a control for
it.

The contents stored in a structure are ordinary gear items with actions of their
own — see [[Item_Gear|Gear]] and the page for each kind of gear.
