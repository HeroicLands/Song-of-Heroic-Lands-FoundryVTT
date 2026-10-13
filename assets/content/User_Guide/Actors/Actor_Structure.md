---
shortcode: structureug
name: {full: "Structure"}
type: doc
subType: userguide
tags: [guide-actors, user-guide-actors-sections]
data: {packFolder: actors}
---

# What Is a Structure?

A Structure is a **place** — a house, a keep, a shrine, a storeroom, a bridge. It is somewhere things are kept and things happen, given an actor of its own so that it can be described, own its contents, and be pointed at.

A Structure records its **maximum Health**, its remaining Health after structural Injuries, and separate limits for people and stored cargo. Its Occupants list names the actors staying there. It remains a fixed place rather than a [[doc-vehicleug|Vehicle]] that travels.

Use it when a location deserves to be a thing in the game rather than a note: an inn the party keeps returning to, a cache in the woods, a temple with a standing blessing on it.

# When to Use a Structure

Use a Structure when:

- A place recurs in play and you want its contents and description to persist
- Stored goods should belong to the place rather than to a character
- A location carries a standing effect — a ward, a consecration, a curse
- You want actions attached to a place (a lever, a ritual performed only there)

For something that moves and carries people, use a [[doc-vehicleug|Vehicle]] instead. For a body of people, use a [[doc-cohortug|Cohort]].

# What a Structure Contains

- **Gear** — everything stored in the place. The cargo limit gives an advisory warning when total stored weight exceeds it.
- **Occupants** — actor references for people staying there, including Cohorts whose resolved members count toward occupancy.
- **Actions** — procedures attached to the place.
- **Effects** — active effects on the place, such as wards or consecrations.

# Damage, Protection and Sieges

Set **Maximum Health** in the header. The system subtracts the sum of the structure's physical Injury severities, using their effective levels, and stops remaining Health at zero. Other Trauma types do not count as structural damage. Removing an Injury or changing its level recalculates Health; no derived value is written over the authored maximum.

Maximum Health starts at zero until you assign it. The system does not choose a maximum for a building or turn zero Health into an automatic destruction result. The GM adjudicates damage, repair, breaches, and destruction. Record structural damage with embedded Injury items.

**Protection remains unimplemented.** No rule determines what a wall or door absorbs or resolves a siege attack against a Structure.

# Health and Capacity

The header shows remaining and maximum Health. Set **Occupant Capacity** as a person count and **Cargo Capacity** as a weight limit in pounds. Both limits start at zero until authored. Exceeding either limit shows a warning; adding occupants or cargo remains allowed.

Occupancy counts resolved Beings and the resolved members of Cohorts, counting each person once. Missing actor references stay visible in the Occupants list but do not contribute to the count. Other actor kinds are not people. Cargo weight sums the effective weight of every embedded gear item multiplied by its quantity; nested contents are counted once, separately from their container.

Use **Add Occupant** on the Occupants tab or the Actions tab to select an actor by shortcode or UUID, with an optional role and title. **Remove Occupant** removes only the reference, never the actor. Roles and titles are descriptive; they do not impose crew or eligibility rules.

# Workshops

Set **Workshop Rating** in the header to one through five stars for a workshop. Zero, the initial value, means this Structure is not a rated workshop. The rating supplies the same-numbered Target Number for crafting masterwork rolls: one star gives TN 1, up to five stars giving TN 5.

The player or GM explicitly chooses which workshop a routine uses. The system does not select a workshop from the character's location, check its trade type, or add a tool-quality bonus. An unrated Structure supplies no workshop Target Number.

Player-invoked macros and routines can use the public [[doc-workshopqualifiers|Workshop Qualifiers]] API to roll against the chosen workshop. See [[doc-crafting#workshop|The Workshop]] for the rules.

# Placing a Structure on a Scene

A structure is placed like any other actor: drag it from the sidebar onto the scene and Foundry creates one token for it. There is no group-or-individual choice and no expansion, as there is for a [[doc-cohortug|Cohort]]. The token carries the structure's name and portrait and does not move on its own. See [[doc-scnsetuptokug|Scene Setup]] for token sizing and vision.

# What a Structure Does Not Model

Structural Health and capacity warnings record the state of the location. The GM adjudicates breaches, repairs, destruction, and movement of people in or out. Protection ratings and siege resolution remain unspecified. The occupant roster does not move anyone's token.

# The Structure Sheet

The Structure sheet has these tabs:

- **Facade** — the public description
- **Profile** — the private dossier, movement rates, and attributes
- **Occupants** — the people staying at the location
- **Mysteries** — mysteries and mystical abilities attached to the place
- **Gear** — stored contents and equipment
- **Actions** — available actions
- **Effects** — active effects

Six are the common actor tabs, and they behave exactly as they do on a [[doc-beingug|Being]]: the Gear tab is the same inventory ledger (a structure's stores instead of a character's possessions), the Mysteries tab lists the same Mystery and Mystical Ability items (a structure usually carries none), and the Actions and Effects tabs are identical. They are documented once, in [[doc-undrstndsheetug|Understanding Sheets]] under _Common Actor Tabs_ — see that page for the columns, controls, and how to add, stow, and remove things.

The **Profile** tab carries three things, and it is where a structure's private notes live:

- **Attributes** — normally empty for a structure. The section is kept so a world that wants to give a keep a Condition rating of its own can.
- **Movement** — the travel rate for each medium, with a star marking the active one.
- **Biography** — the **dossier**, the private description only you and the GM see. The public description a player sees stays on **Facade**.

The one difference: a Being's Gear tab reports carried weight and encumbrance, because a character is slowed by what it carries. A structure does not move, so its Gear tab reports the total weight of its contents alone.

# Intrinsic Actions

A Structure adds occupant-management actions alongside the actions every actor shares:

| Action              | Shortcode           |
| ------------------- | ------------------- |
| Edit                | `editDocument`      |
| Delete              | `deleteDocument`    |
| Make Default Medium | `makeDefaultMedium` |
| Add Occupant        | `addOccupant`       |
| Remove Occupant     | `removeOccupant`    |

The first three belong to every actor and are described on [[doc-baseitemug|Base Item]], which covers what each one does, how it is invoked, and what it produces — the shared document actions are the same wherever they appear.

**Make Default Medium** picks which movement medium an actor is currently moving in, driven by the star control in the movement table on the structure's own **Profile** tab. A structure does not move, so in practice it stays on the _None_ row; the control is there because movement is a capability every actor carries, not because a building is expected to use it.

The contents stored in a structure are ordinary gear items with actions of their own — see [[doc-gearug|Gear]] and the page for each kind of gear.

# See also

- [[doc-ugactors|Actors]] — the four actor kinds and how to choose between them.
- [[doc-vehicleug|Vehicle]] — the moving counterpart, for anything that carries people.
- [[doc-gearug|Gear]] and [[doc-gearandequipug|Working with Gear and Equipment]] — the goods a structure holds.
- [[doc-actionsug|Actions]] — attaching an action to a place.
- [[doc-undrstndsheetug|Understanding Sheets]] — the tabs a structure shares with every other actor.
- [[doc-userguide|User Guide]] — back to the index.
