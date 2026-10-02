---
shortcode: crtngactitemug
name: {full: "Creating Actors and Items"}
type: doc
subType: userguide
data: {packFolder: userguide}
---

# Overview {#creating-overview}

There are several ways to create actors and items in SoHL. The method you choose depends on whether you're starting from scratch, copying something from a compendium, or building a complex item with nested components.

See also: [[doc-quickstartug|Quickstart]], [[doc-undrstndsheetug|Understanding Sheets]]

# Creating Actors {#creating-actors}

## From the Create Dialog (Recommended)

The **Create Actor** button now starts you from a populated template — an **archetype** — so a new Being arrives with body, attributes, and a movement profile already in place, not as a blank slate.

1. Click the **Create Actor** button at the top of the Actors sidebar tab.
2. The Create dialog offers these fields:
   - **Name** — the actor's name.
   - **Shortcode** — a short code that must be **unique among documents of the same type** (it is how the system looks this document up). It auto-fills from the name (and stays in sync as you type) until you edit it by hand; leave it and the system derives and uniquifies one for you on create. If you type a code that is already taken by another document of the same type, the dialog flags it and **Create stays disabled until you pick a unique one**. (Documents of _different_ types may safely share a code.) See [[doc-shortcodesug|Shortcodes]] for why the shortcode is the actor's identity — two actors of the same type that share one are treated as the same thing.
   - **Type** — the actor type (Being, Cohort, Structure, Vehicle).
   - **SubType** — shown only for types that have subtypes.
   - **Archetype** — the starting template. It defaults to the best-matching populated archetype for the chosen type (for a Being, "Basic Folk"), and lists every archetype available for that type plus **(none)**.
3. Click "Create." The new actor opens, seeded from the chosen archetype with your Name and Shortcode applied.

Choose **(none)** when you deliberately want a **blank** actor — for example a world designer authoring a wholly new kind of being (elf, dwarf, …) from scratch. Everything then has to be added by hand.

## From a Compendium

You can still import directly from a compendium — this is also how you make a **world override** of a shipped archetype (see below):

1. Open the **Compendium** tab in the sidebar.
2. Open the appropriate compendium pack (e.g., "People & Creatures").
3. Find the actor you want to use as a starting point.
4. Drag it into the **Actors** sidebar tab, or right-click and select "Import."
5. The imported actor appears in your world — double-click to open and customize.

## By Duplicating

Right-click any actor in the sidebar and select **Duplicate** to create an identical copy. This is useful when you need several similar NPCs.

## Overriding an Archetype in Your World (GM)

The Archetype picker shows the shipped system archetypes _and_ any you provide in your world. To make the picker offer **your** version of an archetype instead of the shipped one:

1. **Import** the archetype into your world (or **Duplicate** an existing world copy) — both keep the archetype marker, so the copy stays an archetype.
2. **Keep its shortcode** unchanged. The shortcode is the archetype's identity: a world copy that keeps the shortcode _shadows_ the shipped archetype of the same shortcode in the picker (your world copy wins). Rename the display name freely — only the shortcode matters for the override.
3. Edit your world copy however you like. New characters created from that archetype now start from your version.

To offer an entirely **new** archetype (a fresh starting template with its own shortcode), just Import/Duplicate a being into your world and it appears in the picker for its type alongside the others.

# Creating Items {#creating-items}

## World Items

World items exist independently in the Items sidebar. They can be dragged onto actors to give characters equipment, skills, or other capabilities.

1. Click **Create Item** in the Items sidebar tab.
2. Choose the item type and enter a name. Like the Create Actor dialog, Create Item offers an **Archetype** picker: if any archetype exists for the chosen type (and subtype), the new item starts seeded from it; choose **(none)** for a blank item.
3. The item's sheet opens for editing.

## Adding Items to Actors

To give an actor an item:

1. Open the actor's sheet.
2. Drag an item from a compendium, the Items sidebar, or another actor's sheet onto the actor's sheet.
3. The item is copied onto the actor. Changes to the copy don't affect the original.

You can also drag items directly from compendiums without importing them to the world first.

## Nested Items

Some items contain other items inside them:

- **Weapon Gear** contains **Strike Modes** (slash, thrust, etc.)
- **Armor Gear** contains **Protection** entries (one per body location)
- **Container Gear** contains other gear items
- **Mystical Devices** contain **Mystical Abilities**

When you drop a complex item (like a weapon from the compendium) onto an actor, all its nested items come along automatically.

To add a nested item to an existing item on an actor, open the parent item's sheet and drag the child item onto its **Nested Items** tab.

# Deleting Items {#creating-deleting}

When deleting items, be aware that **items with nested children cannot be deleted**. You must first remove or delete all nested items before the parent can be deleted. This prevents accidentally orphaning items.

# Organizing the Sidebar {#creating-organizing}

Group actors or items into **folders** the same way in either sidebar tab: click **Create Folder** at the top of the tab, then drag an actor, an item, or another folder onto it to file it there. Folders nest up to four levels deep; the fifth is refused. Each folder carries its own **Name**, a **Color** that tints its row, and a **Sorting Mode** — **Alphabetical** orders its contents by name automatically, **Manual** lets you drag rows into whatever order you want.

Right-click a folder for:

- **Edit Folder** (GM-only) — rename it, recolor it, or change its sorting mode.
- **Export to Compendium** — copies everything inside, optionally with its subfolders, into an unlocked compendium pack you choose.
- **Remove Folder** (GM-only) — deletes the folder itself and moves its contents up to its parent, leaving every actor or item untouched.
- **Delete All** (GM-only) — removes the folder and everything inside it, subfolders included, in one stroke. This is the bulk operation: there is no per-item confirmation, and nothing it deletes can be recovered.

Right-click a single actor or item and **Clear Folder** takes just that one out of its folder, back to the sidebar's root, without touching anything else inside the folder.

# Importing and Exporting {#creating-import-export}

**Export Data**, on an actor's or item's own context menu, writes its complete data to a `.json` file saved to your computer — a snapshot you can keep, hand to another GM, or bring into a different world.

**Import Data**, on the same menu, does the opposite of what the name suggests: it does not create a new actor or item from the file. It **overwrites the data of the document you right-clicked** with whatever the chosen file holds, keeping that document's identity — its id and its place in your world — and replacing everything else about it. Use it to restore an actor or item from a file exported earlier, never to add a new one: dragging from a compendium or the Create dialog is how a new actor or item arrives.

# See also

- [[doc-ugactors|Actors]] — what each of the four actor kinds is for.
- [[doc-ugitems|Items]] — what each item type is for, and what they share.
- [[doc-usingpacksug|Using Compendiums]] — the content that ships with the system, and importing from it.
- [[doc-shortcodesug|Shortcodes]] — why a duplicate keeps its original's shortcode, and when to change it.
- [[doc-charcreationug|Character Creation]] — building a playable character end to end.
- [[doc-undrstndsheetug|Understanding Sheets]] — reading the sheet you have just created.
- [[doc-userguide|User Guide]] — back to the index.
