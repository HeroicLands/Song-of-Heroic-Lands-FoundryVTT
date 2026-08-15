---
aliases:
    - Structure
    - doc-structure
id: STezcXhJMlmYv9XT
type: doc
package: sohl
category: user-guide
name:
    full: "Structure"
shortcode: structure
folder: sYK1BozT9xFcinXK
---

# What Is a Structure?

A Structure is a **place** — a house, a keep, a shrine, a storeroom, a bridge. It
is somewhere things are kept and things happen, given an actor of its own so that
it can be described, own its contents, and be pointed at.

**Its unique capability is simply that it is a place that persists.** Unlike the
other actor kinds, a Structure has no properties of its own at all — and that is
deliberate. It is the plainest actor in the system: a name, a description, the
gear stored in it, the actions you attach to it, and the effects laid on it. What
distinguishes it from a [[Vehicle]] is not a mechanic but a fact
about the fiction — **it does not go anywhere**, and so it has no occupants and no
journey.

Use it when a location deserves to be a thing in the game rather than a note: an
inn the party keeps returning to, a cache in the woods, a temple with a standing
blessing on it.

# When to Use a Structure

Use a Structure when:

- A place recurs in play and you want its contents and description to persist
- Stored goods should belong to the place rather than to a character
- A location carries a standing effect — a ward, a consecration, a curse
- You want actions attached to a place (a lever, a ritual performed only there)

For something that moves and carries people, use a [[Vehicle]]
instead. For a body of people, use a [[Cohort]].

# What a Structure Contains

- **Gear** — everything stored in the place. There is no limit on how much.
- **Actions** — procedures attached to the place.
- **Effects** — active effects on the place, such as wards or consecrations.

# What a Structure Does Not Model

A Structure is scenery with an inventory, not a combatant:

- **No condition.** It has no structural integrity, no hit points, and no damage
  model. Walls cannot be battered down by the rules; a siege is narrated, not
  resolved against the Structure.
- **No capacity.** A storeroom holds as much as you say it does — nothing counts
  or refuses the contents.
- **No occupants.** A Structure does not track who is inside it. If who is present
  matters, that is a matter for tokens on the scene, or a
  [[Cohort]] if the people form a standing group.

# The Structure Sheet

The Structure sheet has these tabs:

- **Facade** — image and description
- **Profile** — the private dossier, movement rates, and attributes
- **Gear** — stored contents and equipment
- **Actions** — available actions
- **Effects** — active effects

All five are the common actor tabs, and they behave exactly as they do on a
[[Being]]: the Gear tab is the same inventory ledger (a structure's
stores instead of a character's possessions), and the Actions and Effects tabs
are identical. They are documented once, in
[[Understanding Sheets]] under _Common Actor Tabs_ — see
that page for the columns, controls, and how to add, stow, and remove things.

The **Profile** tab carries three things, and it is where a structure's private
notes live:

- **Attributes** — normally empty for a structure. The section is kept so a world
  that wants to give a keep a Condition a rating of its own can.
- **Movement** — the travel rate for each medium, with a star marking the active
  one.
- **Biography** — the **dossier**, the private description only you and the GM
  see. The public description a player sees stays on **Facade**.

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

All three belong to every actor and are described on [[Base Item]],
which covers what each one does, how it is invoked, and what it produces — the
shared document actions are the same wherever they appear.

**Make Default Medium** picks which movement medium an actor is currently moving
in, driven by the star control in the movement table on the structure's own
**Profile** tab. A structure does not move, so in practice it stays on the
_None_ row; the control is there because movement is a capability every actor
carries, not because a building is expected to use it.

The contents stored in a structure are ordinary gear items with actions of their
own — see [[doc-itemgear|Gear]] and the page for each kind of gear.

# See also

- [[doc-ugactors|Actors]] — the four actor kinds and how to choose between
  them.
- [[doc-vehicle|Vehicle]] — the moving counterpart, for anything that carries
  people.
- [[doc-itemgear|Gear]] and [[doc-wrkngwth|Working with Gear and Equipment]] —
  the goods a structure holds.
- [[doc-actions|Actions]] — attaching an action to a place.
- [[doc-undrstnd|Understanding Sheets]] — the tabs a structure shares with
  every other actor.
- [[doc-userguide|User Guide]] — back to the index.
