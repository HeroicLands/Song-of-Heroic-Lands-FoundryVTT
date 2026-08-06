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
- **Gear** — shared equipment
- **Afflictions** and **Injuries** — group-level conditions
- **Actions** — group-level procedures
- **Members** — references to the individuals that make up the group

# The Cohort Sheet

The Cohort sheet has these tabs:

- **Facade** — group portrait and description
- **Members** — the individuals that belong to this cohort
- **Actions** — available group actions
- **Effects** — active effects on the group

**Facade**, **Actions**, and **Effects** are the common actor tabs and behave
exactly as they do on a [[Actor_Being|Being]]; they are documented once, in
[[Understanding_Sheets|Understanding Sheets]] under _Common Actor Tabs_. The
**Members** tab is particular to a Cohort.

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
