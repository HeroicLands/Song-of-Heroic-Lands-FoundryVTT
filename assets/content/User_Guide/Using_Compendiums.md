---
aliases: []
id: 0VrqqfwFEbVXxb3e
type: doc
subType: user-guide
name:
  full: "Using Compendiums"
shortcode: usingpacksug
folder: IgwaG8rAUUO9vrtz
---

# Overview {#compendium-overview}

Compendiums are pre-built libraries of actors, items, and journal entries that come with SoHL. They contain ready-to-use characters, creatures, equipment, skills, and reference material. Instead of creating everything from scratch, you import from compendiums and customize.

See also: [[doc-crtngactitemug|Creating Actors and Items]], [[doc-quickstartug|Quickstart]]

# Available Compendium Packs {#compendium-packs}

SoHL ships with these compendium packs:

## People & Creatures

Contains pre-built Beings — characters, NPCs, and creatures ready to use. Each Being comes fully equipped with attributes, skills, body structure, and sometimes gear.

**Key entries:**

- **Basic Folk** — a template human character suitable for duplication and customization. Start here when creating new player characters.

# See also

- [[doc-crtngactitemug|Creating Actors and Items]] — the other three ways to make a document.
- [[doc-shortcodesug|Shortcodes]] — the identifier that keeps an imported copy matched to its compendium original.
- [[doc-charcreationug|Character Creation]] — building on top of an imported character.
- [[doc-quickstartug|Quickstart]] — the import-and-play path, in ten minutes.
- [[doc-syssetngug|System Settings]] — what to set before importing into a new world.
- [[doc-userguide|User Guide]] — back to the index.

<!-- TODO: List other notable entries as they are added to the compendium -->

## Vehicles & Structures

Contains pre-built Vehicle and Structure actors.

<!-- TODO: List notable entries -->

## Characteristics

Contains items that define character capabilities:

- **Attributes** — attribute definitions (Strength, Stamina, etc.) and other innate characteristics
- **Skills** — the full skill list with base formulas and categories
- **Body Structure** — body zones, body parts, and body locations that define anatomy

These are typically imported as part of a complete Being, not individually.

## Possessions

Contains gear items:

- **Weapons** — swords, axes, bows, and other weaponry with strike modes
- **Armor** — protection gear with per-location coverage
- **Equipment** — miscellaneous gear, containers, tools, and supplies

Drag items directly from this compendium onto a character's sheet.

## Journals

Contains reference documentation, including this user guide.

# How to Use Compendiums {#compendium-howto}

## Browsing

1. Click the **Compendium** tab in the sidebar.
2. Click a compendium pack to open it.
3. Browse or search the contents.

## Importing to Your World

There are several ways to get compendium content into your world:

**Drag and drop** (most common):

- Drag an entry from the compendium directly onto the appropriate sidebar tab (Actors, Items) or onto an actor's sheet.
- The entry is copied into your world. Changes to your copy don't affect the compendium original.

**Right-click import:**

- Right-click an entry in the compendium and select "Import."
- The entry appears in the appropriate sidebar tab.

**Bulk import:**

- In a compendium pack, click the "Import All" button to import everything at once. Use this sparingly — it can create a lot of entries.

## Direct Use (Without Importing)

You can drag compendium items directly onto actor sheets without importing them to the world first. This is the most common workflow for adding gear, skills, or attributes to a character.

# Tips {#compendium-tips}

- **Don't modify compendium originals.** Always work with imported copies in your world. Compendium content may be updated when SoHL is updated.
- **Use Basic Folk as a template.** Import it, duplicate it, and customize the duplicate for each new character.
- **Search works.** Use the search bar at the top of an open compendium to find specific entries by name.
- **Your copy stays linked to its origin by shortcode.** An imported copy has a new id and can be customized freely, but it still corresponds to the compendium entry it came from because they share a type and **shortcode**. Keep the shortcode to preserve that link; change it to make a genuinely separate thing. See [[doc-shortcodesug|Shortcodes]].

<!-- TODO: Document how to create custom compendium packs, how world
     compendiums differ from system compendiums, and how updates affect
     existing world copies -->
