---
aliases: []
id: 66xPvvu5LJ8yx9h6
type: doc
package: sohl
category: user-guide
name:
    full: "Creating Actors and Items"
slug: "creating-actors-items"
folder: IgwaG8rAUUO9vrtz
---

# Overview {#creating-overview}

There are several ways to create actors and items in SoHL. The method you
choose depends on whether you're starting from scratch, copying something
from a compendium, or building a complex item with nested components.

See also: [Quickstart](user-guide/quickstart.md), [Understanding Sheets](user-guide/understanding-sheets.md), [Assemblies](user-guide/assemblies.md)

# Creating Actors {#creating-actors}

## From the Create Dialog (Recommended)

The **Create Actor** button now starts you from a populated template — an
**archetype** — so a new Being arrives with body, attributes, and a movement
profile already in place, not as a blank slate.

1. Click the **Create Actor** button at the top of the Actors sidebar tab.
2. The Create dialog offers these fields:
    - **Name** — the actor's name.
    - **Shortcode** — a short, unique code. It auto-fills from the name (and
      stays in sync as you type) until you edit it by hand; leave it and the
      system derives and uniquifies one for you on create.
    - **Type** — the actor type (Being, Cohort, Structure, Vehicle).
    - **SubType** — shown only for types that have subtypes.
    - **Archetype** — the starting template. It defaults to the best-matching
      populated archetype for the chosen type (for a Being, "Basic Folk"), and
      lists every archetype available for that type plus **(none)**.
3. Click "Create." The new actor opens, seeded from the chosen archetype with
   your Name and Shortcode applied.

Choose **(none)** when you deliberately want a **blank** actor — for example a
world designer authoring a wholly new kind of being (elf, dwarf, …) from
scratch. Everything then has to be added by hand.

## From a Compendium

You can still import directly from a compendium — this is also how you make a
**world override** of a shipped archetype (see below):

1. Open the **Compendium** tab in the sidebar.
2. Open the appropriate compendium pack (e.g., "People & Creatures").
3. Find the actor you want to use as a starting point.
4. Drag it into the **Actors** sidebar tab, or right-click and select "Import."
5. The imported actor appears in your world — double-click to open and customize.

## By Duplicating

Right-click any actor in the sidebar and select **Duplicate** to create an
identical copy. This is useful when you need several similar NPCs.

## Overriding an Archetype in Your World (GM)

The Archetype picker shows the shipped system archetypes _and_ any you provide
in your world. To make the picker offer **your** version of an archetype instead
of the shipped one:

1. **Import** the archetype into your world (or **Duplicate** an existing world
   copy) — both keep the archetype marker, so the copy stays an archetype.
2. **Keep its shortcode** unchanged. The shortcode is the archetype's identity:
   a world copy that keeps the shortcode _shadows_ the shipped archetype of the
   same shortcode in the picker (your world copy wins). Rename the display name
   freely — only the shortcode matters for the override.
3. Edit your world copy however you like. New characters created from that
   archetype now start from your version.

To offer an entirely **new** archetype (a fresh starting template with its own
shortcode), just Import/Duplicate a being into your world and it appears in the
picker for its type alongside the others.

# Creating Items {#creating-items}

## World Items

World items exist independently in the Items sidebar. They can be dragged
onto actors to give characters equipment, skills, or other capabilities.

1. Click **Create Item** in the Items sidebar tab.
2. Choose the item type and enter a name. Like the Create Actor dialog, Create
   Item offers an **Archetype** picker: if any archetype exists for the chosen
   type (and subtype), the new item starts seeded from it; choose **(none)** for
   a blank item.
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
