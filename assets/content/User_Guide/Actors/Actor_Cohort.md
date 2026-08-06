---
aliases:
    - Cohort
id: 3uAE5ivwuwl1a1ir
type: doc
package: sohl
category: user-guide
name:
    full: "Cohort"
slug: "actor-cohort"
folder: sYK1BozT9xFcinXK
---

# What Is a Cohort?

A Cohort represents a group acting as a single unit — a squad of soldiers,
a band of followers, a ship's crew, or an adventuring party. Instead of
tracking each individual member as a separate Being, a Cohort simplifies
the group into one entity with shared attributes, skills, and gear.

See also: [Beings](user-guide/actor-being.md)

# When to Use a Cohort

Use a Cohort when:

- You have a group of NPCs that act together (a patrol, a bandit gang)
- You want to simplify a large number of similar characters
- You need to represent a party or faction as a single game entity
- The group has shared resources or capabilities

Do **not** use a Cohort for a single individual — that's a Being.

# What a Cohort Contains

A Cohort can hold:

- **Attributes** — group-level characteristics
- **Skills** — shared capabilities
- **Gear** — the equipment its members have shared with the group (listed, not
  owned: see _The Shared Gear Tab_ below)
- **Afflictions** and **Injuries** — group-level conditions
- **Actions** — group-level procedures
- **Members** — references to the individuals that make up the group

# The Cohort Sheet

The Cohort sheet has these tabs:

- **Facade** — group portrait and description
- **Members** — the individuals that belong to this cohort
- **Shared Gear** — what the members have shared with the group
- **Actions** — available group actions
- **Effects** — active effects on the group

**Facade**, **Actions**, and **Effects** are the common actor tabs and behave
exactly as they do on a [[Actor_Being|Being]]; they are documented once, in
[[Understanding_Sheets|Understanding Sheets]] under _Common Actor Tabs_. The
**Members** and **Shared Gear** tabs are particular to a Cohort.

# The Shared Gear Tab

**Shared Gear** answers one question: what does this group collectively have to
hand? It lists every piece of gear the cohort's members carry _and have marked as
shared with this cohort_ — the party's rope, lantern, tent, and rations, gathered
into one view no matter whose pack they are actually in.

It shows the same columns as an ordinary [[Item_Gear|Gear]] tab — item, type,
quantity, weight, quality, durability, notes — plus one more: **Carried By**, the
member whose sheet the item actually lives on.

## It Is a View, Not a Store

A cohort owns nothing. Nothing on this tab is a copy, and nothing has moved:

- **The item stays on its carrier.** Sharing a coil of rope does not take it out
  of Aldric's pack; it only makes the group aware he has it. The weight still
  counts against Aldric's encumbrance, and only Aldric can use it.
- **The tab is read-only.** There is nothing to drag, nothing to drop, no
  container to reassign, no carried or worn toggle, and no way to create or
  delete an item from here. To change an item, open it on the character that
  carries it.
- **No combined weight is shown.** A total across half a dozen different packs
  is nobody's load, so the tab does not pretend to compute one. Each carrier's
  own Gear tab still reports their encumbrance.

If a member leaves the cohort — or the item is deleted, or you cannot see the
member's actor — the item simply stops appearing here. Nothing is orphaned.

## Sharing an Item With the Cohort

Sharing is set on the **item**, on the character that carries it: open the gear
item's **Properties** tab and pick the cohort (or cohorts) in **Shared With**.
See [[Item_Gear|Gear]] for the control. Because sharing lives on the item, the
carrier's player is always the one who decides what the group gets to see — the
cohort can never reach out and claim something.

<!-- TODO: Expand with details on how members are managed, how cohort-level
     skills/attributes interact with individual member capabilities, and how
     cohort combat works -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->

# Intrinsic Actions

A Cohort defines no actions of its own. It carries only the actions every actor
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
[[Actor_Being|Being]]'s **Profile** tab. The Cohort sheet has no movement table,
so a cohort inherits the action without offering a control for it.

The Beings listed on the **Members** tab keep their own actions on their own
sheets; running an action on the cohort never rolls for a member, and running one
on a member never speaks for the group.
