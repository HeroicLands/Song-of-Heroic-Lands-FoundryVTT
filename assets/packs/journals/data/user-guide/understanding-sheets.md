---
title: "Understanding Sheets"
slug: "understanding-sheets"
category: "User Guide"
sort: 8
tags:
    - sheets
    - ui
    - tabs
    - actors
    - items
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is a Sheet? {#sheets-overview}

When you double-click an actor or item in SoHL, a **sheet** opens. The sheet
is the primary interface for viewing and editing that entity. Every actor and
item in SoHL has a sheet organized into **tabs**, each showing a different
aspect of the entity.

This guide explains the common tabs you'll encounter across all sheets, so
you know where to find things regardless of which type of actor or item you're
looking at.

See also: [Beings](user-guide/actor-being.md), [Character Creation](user-guide/character-creation.md)

# Sheet Header {#sheets-header}

Every sheet has a header at the top showing:

- **Image** — click to change the entity's portrait or icon
- **Name** — click to rename the entity
- **Type label** — shows what kind of actor or item this is

The header is always visible regardless of which tab you're on.

# Common Actor Tabs {#sheets-actor-tabs}

Actor sheets (Beings, Cohorts, Structures, Vehicles) share several common
tabs. Not every actor type has every tab, but when a tab appears, it works
the same way across all actor types.

## Facade

The **Facade** tab shows the actor's portrait image and a rich-text
description field. This is the "at a glance" view — use it for the actor's
appearance, personality notes, or any freeform text.

## Gear

The **Gear** tab lists all equipment carried by the actor — weapons, armor,
containers, miscellaneous items, and their contents. Items can be nested
(a sword inside a scabbard inside a backpack) and the display reflects this
hierarchy.

From this tab you can:
- Drag items from compendiums or the world onto the sheet to add them
- Right-click items for context menu options (edit, delete, equip)
- Click the equip/carry icon to toggle whether an item is actively worn or carried

## Actions

The **Actions** tab shows all executable actions available to this actor.
Actions are procedures that can be triggered — skill tests, combat maneuvers,
special abilities, and more. Click an action's name to execute it.

## Effects

The **Effects** tab shows all active effects currently modifying this actor.
Active effects are temporary or permanent modifiers that change the actor's
stats, abilities, or behavior. Each effect shows its source, duration, and
what it modifies.

## Profile (Beings only)

The **Profile** tab is unique to Beings. It shows:
- **Attributes** — the core traits (Strength, Dexterity, Intelligence, etc.)
- **Other Traits** — non-attribute traits grouped by category
- **Affiliations** — faction memberships and organizational ties
- **Biography** — a rich-text biography field

## Skills (Beings only)

The **Skills** tab lists all skills grouped by category. Each skill shows
its mastery level and any modifiers. Click a skill's name to perform a
skill test.

## Combat (Beings only)

The **Combat** tab shows equipped weapons and their strike modes, armor
and protection, and combat-relevant information.

## Mystical (Beings only)

The **Mystical** tab shows domains, mysteries, philosophies, and mystical
abilities. This is where spellcasters and priests manage their supernatural
capabilities.

## Members (Cohorts only)

The **Members** tab is unique to Cohorts. It shows the individuals that
belong to the group.

# Common Item Tabs {#sheets-item-tabs}

Item sheets share a consistent tab layout across all item types:

## Properties

The **Properties** tab shows the type-specific fields for this item. The
content varies by item type — a Skill shows its skill base formula and
mastery level, a Weapon shows its damage and range, and so on. This is
where you configure the item's game-mechanical properties.

## Description

The **Description** tab provides a rich-text editor for the item's full
description. Use this for flavor text, rules references, or any detailed
notes about the item.

## Nested Items

The **Nested Items** tab appears for items that contain other items inside
them. For example, a Weapon Gear contains Strike Modes, and Armor Gear
contains Protection entries. This tab shows the hierarchy of contained items.

## Actions

The **Actions** tab shows any actions specifically associated with this item
(such as a weapon's attack action or a mystical device's activation).

## Effects

The **Effects** tab shows active effects attached to this item. Item-level
effects can target the item itself, the owning actor, or other items on
the actor.

# Tips {#sheets-tips}

- **Right-click** on most items in a list to get a context menu with edit,
  delete, and other options
- **Drag and drop** items from compendiums, the world sidebar, or other
  sheets to add them
- **Search bars** appear on some tabs (like Skills and Gear) to filter
  long lists
- Changes are saved automatically — there's no "save" button

<!-- TODO: Add screenshots showing the sheet layout for each actor type.
     Add annotated screenshots highlighting where specific fields are located
     on the Properties tab for common item types. -->

<!-- TODO: Document sheet field details for each actor and item type — what
     each field means, what values to enter, and how fields interact with
     each other. This will be covered in the individual type guides. -->
