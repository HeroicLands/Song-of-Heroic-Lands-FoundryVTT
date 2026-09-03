---
aliases: []
id: DplPGYa4Gv1DkL0H
type: doc
subType: user-guide
name:
  full: "Understanding Sheets"
shortcode: undrstndsheetug
folder: IgwaG8rAUUO9vrtz
---

# What Is a Sheet? {#sheets-overview}

When you double-click an actor or item in SoHL, a **sheet** opens. The sheet is the primary interface for viewing and editing that entity. Every actor and item in SoHL has a sheet organized into **tabs**, each showing a different aspect of the entity.

This guide explains the common tabs you'll encounter across all sheets, so you know where to find things regardless of which type of actor or item you're looking at.

See also: [[doc-beingug|Beings]], [[doc-charcreationug|Character Creation]]

# Sheet Header {#sheets-header}

Every sheet has a header at the top showing:

- **Image** — click to change the entity's portrait or icon
- **Name** — click to rename the entity
- **Type label** — shows what kind of actor or item this is

The header is always visible regardless of which tab you're on.

# Common Actor Tabs {#sheets-actor-tabs}

Actor sheets (Beings, Cohorts, Structures, Vehicles) share several common tabs. Not every actor type has every tab, but when a tab appears, it works the same way across all actor types — the **Gear**, **Actions**, and **Effects** tabs described below are the same tab on a character, a ship, and a warehouse, and this is the one place they are documented. The individual type pages ([[doc-beingug|Being]], [[doc-vehicleug|Vehicle]], [[doc-structureug|Structure]], [[doc-cohortug|Cohort]]) describe only what is particular to that type.

## Facade

The **Facade** tab shows the actor's portrait image and a rich-text description field. This is the "at a glance" view — use it for the actor's appearance, personality notes, or any freeform text.

## Profile (Beings only)

The **Profile** tab is unique to Beings. It shows:

- **Attributes** — the core characteristics (Strength, Dexterity, Intelligence, etc.)
- **Affiliations** — faction memberships and organizational ties
- **Biography** — a rich-text biography field

## Skills (Beings only)

The **Skills** tab lists all skills grouped by category. Each skill shows its mastery level and any modifiers. Click a skill's name to perform a skill test.

## Combat (Beings only)

The **Combat** tab shows equipped weapons and their strike modes, armor and protection, and combat-relevant information.

## Mystical (Beings only)

The **Mysteries** tab shows mysteries and mystical abilities. This is where spellcasters and priests manage their supernatural capabilities.

## Members (Cohorts only)

The **Members** tab is unique to Cohorts. It rosters the individuals that belong to the group — each named by the actor it references, with its role and a chess-king marking the leader — and carries the controls that add a member, remove one, and set who leads. See [[doc-cohortug|Cohort]].

## Gear

The **Gear** tab is the actor's inventory: a character's possessions, a vehicle's cargo, a structure's stores. It lists every piece of gear the actor holds — weapons, armor, containers, projectiles, concoctions, and miscellaneous items.

Gear is grouped into **sections**. The first, **On Body**, holds everything that is not inside a container; each container the actor holds then gets its own section listing its contents, so a sword in a scabbard appears under the scabbard rather than loose. A section's banner carries a capacity readout: a container shows how much it holds against how much it can hold, and a [[doc-beingug|Being]]'s On Body section shows total carried weight and the resulting encumbrance instead (a vehicle or structure is not encumbered by its load, so it shows the weight alone).

Each row shows the item's icon and name, its **Type**, **Qty** (quantity), **Weight**, **Qual** (quality), **Dur** (durability), and **Notes**. Hovering Weight, Qual, or Dur shows how that value was derived — the base value and every modifier applied to it.

From this tab you can:

- **Add gear** with the **Add Gear** control on a section's banner, which opens the item-create dialog.
- **Drag items** from a compendium, the sidebar, or another actor's sheet onto the sheet to add them. Dragging from another actor _moves_ the item; a stack of more than one prompts for how many to move (shift-drag moves the lot). Dragging from a compendium or the world copies it.
- **Toggle carried** with the knapsack control, marking whether the item is on the actor's person (or, for a vehicle or structure, in active use rather than stowed).
- **Toggle worn** with the shield control, on armor only. Worn armor is what feeds protection totals. Armor that is not carried cannot be worn, so the control is disabled until it is.
- **Edit or delete** an item from the ⋮ menu at the end of its row (or by right-clicking the row).
- **Search** the tab with the box at the top, which filters rows by name.

## Shared Gear (Cohorts only)

The **Shared Gear** tab is unique to Cohorts. It lists the gear the group's members have marked as shared with the cohort, with the member who carries each item. It is a view, not a store: the items stay on their carriers. See [[doc-cohortug|Cohort]].

## Actions

The **Actions** tab lists every action the actor can run, in two sections.

**Custom** actions are the ones a GM has added to this actor by binding a world Macro to it. Use **Create Action** to add one — you pick an existing Macro, or `<New Macro…>` to write a fresh one — and each row's controls let you open the bound Macro for editing, remove the action (the Macro itself is left alone), or run it.

**Intrinsic** actions are built into the system for that kind of actor or item. They are read-only: you cannot add, edit, or remove them, only run them.

Each row shows the action's icon and name, the menu group it sorts into, and any notes. Click the **▶** control to run an action; hold **shift** while clicking to skip its configuration dialog and run it with its defaults. Internal lifecycle actions the system runs on its own are never listed here.

Actions are always run at your say-so — SoHL never runs one for you. See [[doc-actionsug|Actions]] for what actions are and how they work.

## Effects

The **Effects** tab shows the active effects modifying this actor, in two sections.

**Own Effects** are effects placed directly on the actor. Each row shows the effect's name, its **Target** (what it applies to), the time **Remaining** (or _Indefinite_), and how many **changes** it makes. Use **Create Effect** to add one; each row's controls enable or disable the effect, delete it, or open the ⋮ menu.

**Transferred Effects** are effects that come from items the actor holds — a cursed blade's penalty, an amulet's blessing. They are read-only here and show which item they came from as their **Source**; to change one, edit it on the item that carries it.

Both lists can be filtered with the search box at the top of the tab.

# Common Item Tabs {#sheets-item-tabs}

Item sheets share a consistent tab layout across all item types:

## Properties

The **Properties** tab shows the type-specific fields for this item. The content varies by item type — a Skill shows its skill base formula and mastery level, a Weapon shows its damage and range, and so on. This is where you configure the item's game-mechanical properties.

## Description

The **Description** tab provides a rich-text editor for the item's full description. Use this for flavor text, rules references, or any detailed notes about the item.

## Actions

The **Actions** tab shows any actions specifically associated with this item (such as a weapon's attack action or a mystical device's activation).

## Effects

The **Effects** tab shows active effects attached to this item. Item-level effects can target the item itself, the owning actor, or other items on the actor.

# Tips {#sheets-tips}

- **Right-click** on most items in a list to get a context menu with edit, delete, and other options
- **Drag and drop** items from compendiums, the world sidebar, or other sheets to add them
- **Search bars** appear on some tabs (like Skills and Gear) to filter long lists
- Changes are saved automatically — there's no "save" button

# See also

- [[doc-ugactors|Actors]] — the four actor sheets, kind by kind.
- [[doc-ugitems|Items]] — the item sheets, and what every one of them shares.
- [[doc-iconlgndug|Icon Legend]] — every glyph on a tab strip or a row.
- [[doc-actionsug|Actions]] — what the Actions tab lists, and how to add to it.
- [[doc-crtngactitemug|Creating Actors and Items]] — making the documents these sheets open onto.
- [[doc-gearandequipug|Working with Gear and Equipment]] — using the Gear tab.
- [[doc-userguide|User Guide]] — back to the index.

<!-- TODO: Add screenshots showing the sheet layout for each actor type.
     Add annotated screenshots highlighting where specific fields are located
     on the Properties tab for common item types. -->

<!-- TODO: Document sheet field details for each actor and item type — what
     each field means, what values to enter, and how fields interact with
     each other. This will be covered in the individual type guides. -->
