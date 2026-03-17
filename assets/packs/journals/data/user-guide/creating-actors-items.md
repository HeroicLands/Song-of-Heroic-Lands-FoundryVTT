---
title: "Creating Actors and Items"
slug: "creating-actors-items"
category: "User Guide"
sort: 9
tags:
    - ui
    - actors
    - items
    - creation
    - compendium
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# Overview {#creating-overview}

There are several ways to create actors and items in SoHL. The method you
choose depends on whether you're starting from scratch, copying something
from a compendium, or building a complex item with nested components.

See also: [Quickstart](user-guide/quickstart.md), [Understanding Sheets](user-guide/understanding-sheets.md), [Assemblies](user-guide/assemblies.md)

# Creating Actors {#creating-actors}

## From a Compendium (Recommended)

The easiest way to create a new character or creature is to **import from a
compendium**:

1. Open the **Compendium** tab in the sidebar.
2. Open the appropriate compendium pack (e.g., "People & Creatures").
3. Find the actor you want to use as a starting point.
4. Drag it into the **Actors** sidebar tab, or right-click and select "Import."
5. The imported actor appears in your world — double-click to open and customize.

This is strongly recommended for Beings, because a Being requires many nested
items (traits, skills, body structure) that are tedious to set up by hand.

## From the Create Dialog

You can also create a blank actor:

1. Click the **Create Actor** button at the top of the Actors sidebar tab.
2. Choose the actor type (Being, Cohort, Structure, Vehicle).
3. Enter a name and click "Create."
4. The new actor opens with no items — you'll need to add everything manually.

> **Note:** Creating a Being from scratch is not recommended. Use the compendium
> instead and customize from there.

## By Duplicating

Right-click any actor in the sidebar and select **Duplicate** to create an
identical copy. This is useful when you need several similar NPCs.

# Creating Items {#creating-items}

## World Items

World items exist independently in the Items sidebar. They can be dragged
onto actors to give characters equipment, skills, or other capabilities.

1. Click **Create Item** in the Items sidebar tab.
2. Choose the item type and enter a name.
3. The item's sheet opens for editing.

## Adding Items to Actors

To give an actor an item:

1. Open the actor's sheet.
2. Drag an item from a compendium, the Items sidebar, or another actor's
   sheet onto the actor's sheet.
3. The item is copied onto the actor. Changes to the copy don't affect the
   original.

You can also drag items directly from compendiums without importing them to
the world first.

## Nested Items

Some items contain other items inside them:

- **Weapon Gear** contains **Strike Modes** (slash, thrust, etc.)
- **Armor Gear** contains **Protection** entries (one per body location)
- **Container Gear** contains other gear items
- **Mystical Devices** contain **Mystical Abilities**

When you drop a complex item (like a weapon from the compendium) onto an
actor, all its nested items come along automatically.

To add a nested item to an existing item on an actor, open the parent item's
sheet and drag the child item onto its **Nested Items** tab.

# Creating Assemblies {#creating-assemblies}

Assemblies are special containers for complex items with nested components.
There are two ways to create them:

## From the Assemblies Sidebar

1. Open the **Assemblies** tab in the sidebar (look for the box icon).
2. Click **Create Assembly**.
3. A Create Item dialog appears — choose the item type and name.
4. The item is created inside a new Assembly with the same name.

## From the Items Sidebar

1. Right-click any World Item in the Items sidebar.
2. Select **Create Assembly** from the context menu.
3. A new Assembly is created containing a copy of that item.

This is useful when you have a world item that you want to package with
nested components for easy distribution.

See [Assemblies](user-guide/assemblies.md) for more about how Assemblies work.

# Deleting Items {#creating-deleting}

When deleting items, be aware that **items with nested children cannot be
deleted**. You must first remove or delete all nested items before the parent
can be deleted. This prevents accidentally orphaning items.

<!-- TODO: Expand with details on bulk operations, folder organization in
     the sidebar, and import/export workflows -->
